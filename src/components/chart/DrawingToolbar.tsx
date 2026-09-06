"use client";
import { useEffect, useRef, useState } from "react";
import type { IChartApi } from "lightweight-charts";
import { Crosshair, Minus, MoveRight, Square, Type, Trash2, ChevronDown, Ruler, GitBranch, PenLine, Undo2 } from "lucide-react";
import { DRAWING_CATEGORIES, DRAWING_TOOL_CATALOG } from "./DrawingToolCatalog";

type Anchor={time:number;price:number};
type Draw={tool:string;a:Anchor;b?:Anchor;text?:string};
const QUICK=["Cross","Trend line","Ray","Horizontal line","Vertical line","Rectangle","Fibonacci retracement","Price range","Text"];
const ICONS=[Crosshair,Minus,MoveRight,Square,Square,Type,Ruler,GitBranch,PenLine];
const FIB=[0,.236,.382,.5,.618,.786,1];
const onePoint=(t:string)=>["Horizontal line","Vertical line","Cross","Dot","Text","Note","Anchored note","Price note","Comment","Callout","Arrow marker","Arrow marks","Magic","Eraser"].includes(t);
interface Props{chart:IChartApi|null;symbol:string;timeframe:string;chartId:string}

export function DrawingToolbar({chart,symbol,timeframe,chartId}:Props){
 const [open,setOpen]=useState(false),[active,setActive]=useState(""),[drawings,setDrawings]=useState<Draw[]>([]),[draft,setDraft]=useState<Anchor|null>(null),[cursor,setCursor]=useState<Anchor|null>(null),[,rerender]=useState(0);
 const box=useRef<HTMLDivElement>(null); const storageKey=`jk-drawings-v3-${chartId}-${symbol}-${timeframe}`;
 useEffect(()=>{try{const raw=localStorage.getItem(storageKey);const x=raw?JSON.parse(raw):[];setDrawings(Array.isArray(x)?x:[])}catch{setDrawings([])}},[storageKey]);
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(drawings))}catch{}},[storageKey,drawings]);
 useEffect(()=>{const clear=()=>{setDrawings([]);setDraft(null);setCursor(null);try{localStorage.removeItem(storageKey)}catch{}};window.addEventListener("jk-clear-drawings",clear);return()=>window.removeEventListener("jk-clear-drawings",clear)},[storageKey]);
 useEffect(()=>{if(!chart)return;const fn=()=>rerender(v=>v+1);const ts=chart.timeScale();ts.subscribeVisibleLogicalRangeChange(fn);const ro=new ResizeObserver(fn);if(box.current)ro.observe(box.current);return()=>{ts.unsubscribeVisibleLogicalRangeChange(fn);ro.disconnect()}},[chart]);
 const point=(e:{clientX:number;clientY:number})=>{if(!chart||!box.current)return null;const r=box.current.getBoundingClientRect();const x=Math.max(0,Math.min(r.width,e.clientX-r.left)),y=Math.max(0,Math.min(r.height,e.clientY-r.top));const time=chart.timeScale().coordinateToTime(x),price=chart.priceScale("right").coordinateToPrice(y);if(time==null||price==null)return null;return{time:Number(time),price:Number(price)}};
 const pixel=(p:Anchor)=>{if(!chart)return null;const x=chart.timeScale().timeToCoordinate(p.time as any),y=chart.priceScale("right").priceToCoordinate(p.price);return x==null||y==null?null:{x,y}};
 const choose=(name:string)=>{setActive(v=>v===name?"":name);setOpen(false);setDraft(null);setCursor(null)};
 const addOne=(tool:string,p:Anchor)=>{if(["Text","Note","Anchored note","Price note","Comment","Callout"].includes(tool)){const text=window.prompt("Enter text:");if(!text?.trim())return;setDrawings(ds=>[...ds,{tool,a:p,b:p,text:text.trim()}]);return}setDrawings(ds=>[...ds,{tool,a:p,b:p}])};
 const down=(e:React.PointerEvent<HTMLDivElement>)=>{if(!active||(e.target instanceof HTMLElement&&e.target.closest("button")))return;const p=point(e);if(!p)return;e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture?.(e.pointerId);setCursor(p);if(active==="Eraser"){setDrawings(ds=>ds.slice(0,-1));return}if(onePoint(active)){addOne(active,p);return}setDraft(p)};
 const move=(e:React.PointerEvent<HTMLDivElement>)=>{if(!active)return;const p=point(e);if(p)setCursor(p)};
 const up=(e:React.PointerEvent<HTMLDivElement>)=>{if(!active||!draft)return;const p=point(e);if(p&&Math.hypot(p.time-draft.time,p.price-draft.price)>0)setDrawings(ds=>[...ds,{tool:active,a:draft,b:p}]);setDraft(null)};
 const shape=(d:Draw,i:number)=>{const a=d.a,b=d.b||d.a,A=pixel(a),B=pixel(b);if(!A||!B)return null;const c={key:i,stroke:"#fff",strokeWidth:1.5,fill:"none",vectorEffect:"non-scaling-stroke" as const};
  if(["Horizontal line","Horizontal ray line"].includes(d.tool))return <line {...c} x1="0" y1={A.y} x2="100%" y2={A.y}/>;
  if(d.tool==="Horizontal segment")return <line {...c} x1={A.x} y1={A.y} x2={B.x} y2={A.y}/>;
  if(["Vertical line","Vertical ray line"].includes(d.tool))return <line {...c} x1={A.x} y1="0" x2={A.x} y2="100%"/>;
  if(d.tool==="Vertical segment")return <line {...c} x1={A.x} y1={A.y} x2={A.x} y2={B.y}/>;
  if(["Cross","Crossline"].includes(d.tool))return <g key={i}><line {...c} x1={d.tool==="Crossline"?0:A.x-10} y1={A.y} x2={d.tool==="Crossline"?"100%":A.x+10} y2={A.y}/><line {...c} x1={A.x} y1={d.tool==="Crossline"?0:A.y-10} x2={A.x} y2={d.tool==="Crossline"?"100%":A.y+10}/></g>;
  if(["Rectangle","Gann box"].includes(d.tool))return <rect {...c} x={Math.min(A.x,B.x)} y={Math.min(A.y,B.y)} width={Math.abs(B.x-A.x)} height={Math.abs(B.y-A.y)}/>;
  if(["Circle","Ellipse"].includes(d.tool))return <ellipse {...c} cx={(A.x+B.x)/2} cy={(A.y+B.y)/2} rx={Math.abs(B.x-A.x)/2} ry={Math.abs(B.y-A.y)/2}/>;
  if(d.tool==="Triangle")return <polygon {...c} points={`${A.x},${B.y} ${(A.x+B.x)/2},${A.y} ${B.x},${B.y}`}/>;
  if(["Fibonacci retracement","Fibonacci extension","Fib channel"].includes(d.tool))return <g key={i}><line {...c} x1={A.x} y1={A.y} x2={B.x} y2={B.y}/>{FIB.map((v,j)=>{const y=A.y+(B.y-A.y)*v;return <g key={j}><line x1={A.x} y1={y} x2={B.x} y2={y} stroke="#aaa" strokeWidth="1"/><text x={B.x+5} y={y-3} fill="#aaa" fontSize="10">{Math.round(v*100)}%</text></g>})}</g>;
  if(["Arrow","Trend line","Info line","Extended line","Trend angle","Ray","Arrow marker","Price range","Date range","Date and price range","Parallel channel","Regression trend","Pitchfan","Gann fan","Segment","Straight line","Parallel straight line"].includes(d.tool)){let E=B;if(d.tool==="Ray"){const dx=B.x-A.x,dy=B.y-A.y;E={x:A.x+dx*4,y:A.y+dy*4}}return <line {...c} x1={A.x} y1={A.y} x2={E.x} y2={E.y}/>}
  if(["Text","Note","Anchored note","Price note","Comment","Callout"].includes(d.tool))return <text key={i} x={A.x} y={A.y} fill="#fff" fontSize="12">{d.text||d.tool}</text>;
  return <line {...c} x1={A.x} y1={A.y} x2={B.x} y2={B.y}/>;
 };
 const preview=draft&&cursor?shape({tool:active,a:draft,b:cursor},99999):null;
 return <div ref={box} className={`absolute inset-0 z-[75] ${active?"pointer-events-auto":"pointer-events-none"}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>setDraft(null)} style={{touchAction:active?"none":"auto"}}>
  <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col rounded-lg border border-[#333] bg-[#080808]/95 shadow-2xl backdrop-blur-sm overflow-visible">{QUICK.map((name,i)=>{const I=ICONS[i];return <button key={name} type="button" title={name} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();choose(name)}} className={`w-9 h-9 flex items-center justify-center border-b border-[#222] ${active===name?"bg-[#222] text-white":"text-[#aaa] hover:bg-[#171717] hover:text-white"}`}><I size={16}/></button>})}<button type="button" title="Undo" onPointerDown={e=>e.stopPropagation()} onClick={()=>setDrawings(ds=>ds.slice(0,-1))} className="w-9 h-8 flex items-center justify-center border-b border-[#222] text-[#aaa] hover:text-white"><Undo2 size={15}/></button><button type="button" title="More drawing tools" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setOpen(v=>!v)}} className="w-9 h-9 flex items-center justify-center text-[#aaa] hover:bg-[#171717] hover:text-white"><ChevronDown size={15}/></button>{open&&<div className="absolute left-11 top-0 w-64 max-h-[80vh] overflow-y-auto rounded-lg border border-[#333] bg-[#090909] shadow-2xl p-2 pointer-events-auto"><div className="px-2 py-1 text-[11px] uppercase tracking-wider text-[#777]">All drawing tools</div>{DRAWING_CATEGORIES.map(cat=><div key={cat} className="mb-2"><div className="px-2 py-1 text-xs font-semibold text-[#aaa]">{cat}</div>{DRAWING_TOOL_CATALOG.filter(x=>x.category===cat).map(t=><button key={`${cat}-${t.name}`} type="button" onClick={()=>choose(t.name)} className={`w-full rounded px-2 py-1.5 text-left text-xs ${active===t.name?"bg-[#222] text-white":"text-[#bbb] hover:bg-[#171717] hover:text-white"}`}>{t.name}</button>)}</div>)}<button type="button" onClick={()=>{setDrawings([]);setDraft(null);setOpen(false);try{localStorage.removeItem(storageKey)}catch{}}} className="sticky bottom-0 w-full mt-1 rounded border border-red-900/60 bg-[#120606] px-2 py-2 text-xs text-red-300 flex items-center gap-2"><Trash2 size={13}/> Clear drawings</button></div>}</div>
  {(drawings.length>0||preview)&&<svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">{drawings.map(shape)}{preview}</svg>}
  {active&&cursor&&(()=>{const p=pixel(cursor);return p?<div className="absolute pointer-events-none" style={{left:p.x,top:p.y}}><div className="absolute -left-3 -top-px w-6 h-px bg-white/70"/><div className="absolute -top-3 -left-px w-px h-6 bg-white/70"/></div>:null})()}
 </div>;
}
