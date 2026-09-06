"use client";
import {useEffect,useRef,useState} from "react";
import {init,dispose,registerIndicator} from "klinecharts";
import {calculateIndicator,Candle} from "./indicatorMath";
import {TimeframeSelector} from "./TimeframeSelector";
import {IndicatorMenu} from "./IndicatorMenu";

interface Props{symbol:string;timeframe:string;height?:number;onSymbolClick?:()=>void;onTimeframeChange?:(tf:string)=>void}
interface IndicatorItem{id:string;name:string}
const intervals:Record<string,string>={"1m":"1m","5m":"5m","15m":"15m","1H":"1h","4H":"4h","1D":"1d"};
const seconds:Record<string,number>={"1m":60,"5m":300,"15m":900,"1H":3600,"4H":14400,"1D":86400};
const colors=()=>{if(typeof window==="undefined")return{up:"#fff",down:"#666"};try{const p=JSON.parse(localStorage.getItem("jk-candle-colors")||"null");if(p?.up&&p?.down)return{up:p.up,down:p.down}}catch{}return{up:"#fff",down:"#666"}};
const readIndicators=():IndicatorItem[]=>{try{const x=JSON.parse(localStorage.getItem("jk-indicators")||"[]");return Array.isArray(x)?x.map((v:any,i:number)=>typeof v==="string"?{id:`${v}-${i+1}`,name:v}:v&&v.id&&v.name?v:null).filter(Boolean):[]}catch{return[]}};
const readConfig=():Record<string,Record<string,number>>=>{try{return JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}")||{}}catch{return{}}};
const formatCountdown=(sec:number)=>sec>=3600?`${Math.floor(sec/3600)}:${String(Math.floor(sec%3600/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`:`${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
const safe=(x:string)=>x.replace(/[^a-zA-Z0-9_]/g,"_");

export function ChartPane({symbol,timeframe,height=400,onSymbolClick,onTimeframeChange}:Props){
 const el=useRef<HTMLDivElement>(null),chart=useRef<any>(null);const[indicators,setIndicators]=useState<IndicatorItem[]>([]),[indicatorVersion,setIndicatorVersion]=useState(0),[countdown,setCountdown]=useState(0),[countdownTop,setCountdownTop]=useState<number|null>(null);
 useEffect(()=>{setIndicators(readIndicators());const fn=()=>{setIndicators(readIndicators());setIndicatorVersion(v=>v+1)};window.addEventListener("jk-indicators-changed",fn);return()=>window.removeEventListener("jk-indicators-changed",fn)},[]);
 useEffect(()=>{const tick=()=>{const s=seconds[timeframe]||900;const now=Math.floor(Date.now()/1000);const rem=s-(now%s);setCountdown(rem===s?0:rem);if(chart.current){try{const size=chart.current.getSize("candle_pane","main");setCountdownTop(Math.max(4,Math.min(height-24,size.height/2)))}catch{}}};tick();const id=window.setInterval(tick,250);return()=>window.clearInterval(id)},[timeframe,height]);
 useEffect(()=>{if(!el.current)return;const cc=colors();const light=document.documentElement.classList.contains("light");const c=init(el.current,{styles:light?"light":"dark"} as any);if(!c)return;chart.current=c;
 c.setStyles({candle:{bar:{upColor:cc.up,downColor:cc.down,upBorderColor:cc.up,downBorderColor:cc.down,upWickColor:cc.up,downWickColor:cc.down}}});
 const theme=()=>{if(!chart.current)return;const l=document.documentElement.classList.contains("light");chart.current.setStyles(l?"light":"dark");const x=colors();chart.current.setStyles({candle:{bar:{upColor:x.up,downColor:x.down,upBorderColor:x.up,downBorderColor:x.down,upWickColor:x.up,downWickColor:x.down}}})};
 const mo=new MutationObserver(theme);mo.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});const ro=new ResizeObserver(()=>{try{c.resize()}catch{}});ro.observe(el.current);window.addEventListener("jk-candle-colors-changed",theme);
 return()=>{mo.disconnect();ro.disconnect();window.removeEventListener("jk-candle-colors-changed",theme);try{dispose(c)}catch{};chart.current=null};
 },[height]);
 useEffect(()=>{let stop=false;const load=async()=>{if(!chart.current)return;try{const r=await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${intervals[timeframe]||"15m"}&limit=1000`,{cache:"no-store"});const raw=await r.json();if(stop||!Array.isArray(raw)||!raw.length)return;const d:Candle[]=raw.map((k:any)=>({time:Math.floor(k[0]/1000),open:+k[1],high:+k[2],low:+k[3],close:+k[4],volume:+k[5]}));const data=d.map(x=>({timestamp:x.time*1000,open:x.open,high:x.high,low:x.low,close:x.close,volume:x.volume,turnover:((x.open+x.high+x.low+x.close)/4)*x.volume}));
 const cfgs=readConfig();const c=chart.current;try{c.applyNewData(data);c.scrollToRealTime()}catch(e){console.error(e)}
 for(const item of indicators){const cfg:any=cfgs[item.id]||cfgs[item.name]||{};const result:any=calculateIndicator(item.name,d,cfg);if(!result)continue;const customName=`JK_${safe(item.id)}_${safe(item.name)}`;
   try{registerIndicator({name:customName,shortName:item.name,calcParams:[],figures:(result.lines||[]).map((line:any,i:number)=>({key:`v${i}`,title:`${line.name||item.name}: `,type:"line"})),minValue:result.minValue??result.min,maxValue:result.maxValue??result.max,series:result.kind==="overlay"?"price":"normal",calc:(list:any[])=>{const candles:Candle[]=list.map((x:any)=>({time:x.timestamp,open:+x.open,high:+x.high,low:+x.low,close:+x.close,volume:+x.volume}));const out:any[]=list.map(()=>({}));const res:any=calculateIndicator(item.name,candles,cfg);for(let i=0;i<list.length;i++)for(let j=0;j<(res?.lines||[]).length;j++){const v=res.lines[j].values[i];if(v!=null)out[i][`v${j}`]=v}return out}} as any);
     if(result.kind==="volume")c.createIndicator("VOL",false,{height:90});else if(result.kind==="overlay")c.createIndicator(customName,true,{id:"candle_pane"});else c.createIndicator(customName,false,{height:125});
   }catch(e){console.warn("Indicator registration failed",item.name,e)}
 }
 }catch(e){console.error(e)}};load();return()=>{stop=true}},[symbol,timeframe,indicators.map(x=>x.id).join("|"),indicatorVersion]);
 const changeTimeframe=(tf:string)=>{if(tf!==timeframe)onTimeframeChange?.(tf)};
 return <div className="w-full h-full relative border border-[#1a1a1a] bg-black select-none overflow-hidden"><div className="absolute top-2 left-2 z-[70] flex items-center gap-1"><button onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSymbolClick?.()}} className="text-xs bg-black/80 px-2 py-1 rounded border border-[#333] text-white">{symbol}</button><div onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} className="flex items-center gap-1"><IndicatorMenu/></div></div><div className="absolute top-2 right-2 z-[60] pointer-events-auto flex items-center gap-1"><div onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} className="rounded-md bg-black/80 border border-[#333] px-1 py-1 shadow-lg"><TimeframeSelector value={timeframe} onChange={changeTimeframe}/></div></div>{countdownTop!==null&&<div className="absolute right-1 z-[55] rounded-sm bg-black/90 border border-white/50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white tabular-nums pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.35)]" style={{top:countdownTop}} title="Time remaining in current candle">{formatCountdown(countdown)}</div>}<div ref={el} style={{height}} className="w-full"/></div>;
}
