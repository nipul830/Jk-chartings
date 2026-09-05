"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { Wrench, Trash2, Pencil, X } from "lucide-react";

interface ChartPaneProps { symbol: string; timeframe: string; height?: number; onSymbolClick?: () => void; }
type Point = { x: number; y: number };
type Drawing = { tool: string; a: Point; b: Point };

const intervalMap: Record<string, string> = { "1m":"1m", "5m":"5m", "15m":"15m", "1H":"1h", "4H":"4h", "1D":"1d" };
const defaultUp = "#ffffff", defaultDown = "#666666";
const COLOR_EVENT = "jk-candle-colors-changed", FIB_EVENT = "jk-fib-settings-changed";
const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const TOOLS = ["Trend line", "Horizontal line", "Vertical line", "Ray", "Rectangle", "Fibonacci Retracement"];

function getCandleColors(){
  if(typeof window === "undefined") return {up:defaultUp,down:defaultDown};
  try{const s=localStorage.getItem("jk-candle-colors");if(s){const p=JSON.parse(s);if(p?.up&&p?.down)return {up:p.up,down:p.down};}}catch{}
  return {up:defaultUp,down:defaultDown};
}
function getFibLevels(){
  if(typeof window === "undefined") return DEFAULT_FIB_LEVELS;
  try{const s=localStorage.getItem("jk-fib-levels");if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length)return p.map(Number).filter(Number.isFinite);}}catch{}
  return DEFAULT_FIB_LEVELS;
}

export function ChartPane({symbol,timeframe,height=400,onSymbolClick}:ChartPaneProps){
  const containerRef=useRef<HTMLDivElement>(null),chartRef=useRef<IChartApi|null>(null),seriesRef=useRef<ISeriesApi<"Candlestick">|null>(null);
  const colorsRef=useRef(getCandleColors());
  const [showTools,setShowTools]=useState(false),[selectedTool,setSelectedTool]=useState<string|null>(null);
  const [showFibSettings,setShowFibSettings]=useState(false),[fibLevels,setFibLevels]=useState<number[]>(getFibLevels());
  const [drawings,setDrawings]=useState<Drawing[]>([]),[draftStart,setDraftStart]=useState<Point|null>(null),[draftEnd,setDraftEnd]=useState<Point|null>(null),[activeDrawing,setActiveDrawing]=useState<number|null>(null);

  const applyCandleColors=(up:string,down:string)=>{colorsRef.current={up,down};seriesRef.current?.applyOptions({upColor:up,downColor:down,borderUpColor:up,borderDownColor:down,wickUpColor:up,wickDownColor:down});};

  useEffect(()=>{
    if(!containerRef.current)return;
    colorsRef.current=getCandleColors();
    const light=document.documentElement.classList.contains("light");
    const chart=createChart(containerRef.current,{width:Math.max(1,containerRef.current.clientWidth),height,layout:{background:{color:light?"#fff":"#000"},textColor:light?"#111":"#fff"},grid:{vertLines:{color:light?"#e5e5e5":"#1a1a1a"},horzLines:{color:light?"#e5e5e5":"#1a1a1a"}},crosshair:{mode:0},rightPriceScale:{borderColor:light?"#d0d0d0":"#222"},timeScale:{borderColor:light?"#d0d0d0":"#222",timeVisible:true}});
    const candles=chart.addCandlestickSeries({upColor:colorsRef.current.up,downColor:colorsRef.current.down,borderUpColor:colorsRef.current.up,borderDownColor:colorsRef.current.down,wickUpColor:colorsRef.current.up,wickDownColor:colorsRef.current.down});
    chartRef.current=chart;seriesRef.current=candles;
    const theme=()=>{const l=document.documentElement.classList.contains("light");chart.applyOptions({layout:{background:{color:l?"#fff":"#000"},textColor:l?"#111":"#fff"},grid:{vertLines:{color:l?"#e5e5e5":"#1a1a1a"},horzLines:{color:l?"#e5e5e5":"#1a1a1a"}},rightPriceScale:{borderColor:l?"#d0d0d0":"#222"},timeScale:{borderColor:l?"#d0d0d0":"#222"}});applyCandleColors(colorsRef.current.up,colorsRef.current.down);};
    const colorChange=()=>{const c=getCandleColors();applyCandleColors(c.up,c.down);};
    const fibChange=()=>setFibLevels(getFibLevels());
    const mo=new MutationObserver(theme);mo.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    window.addEventListener(COLOR_EVENT,colorChange);window.addEventListener(FIB_EVENT,fibChange);
    const ro=new ResizeObserver(()=>containerRef.current&&chart.applyOptions({width:Math.max(1,containerRef.current.clientWidth),height}));ro.observe(containerRef.current);
    return()=>{mo.disconnect();ro.disconnect();window.removeEventListener(COLOR_EVENT,colorChange);window.removeEventListener(FIB_EVENT,fibChange);chart.remove();chartRef.current=null;seriesRef.current=null;};
  },[height]);

  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{if(!seriesRef.current)return;const interval=intervalMap[timeframe]||"15m";const url=`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`;
      for(let i=0;i<3&&!cancelled;i++){try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error(`HTTP ${r.status}`);const raw=await r.json();if(!Array.isArray(raw)||!raw.length)throw Error("No data");const data:CandlestickData[]=raw.map((k:any)=>({time:Math.floor(k[0]/1000) as any,open:+k[1],high:+k[2],low:+k[3],close:+k[4]}));if(!cancelled&&seriesRef.current){seriesRef.current.setData(data);chartRef.current?.timeScale().fitContent();}return;}catch(e){if(i<2)await new Promise(r=>setTimeout(r,500*(i+1)));else console.error(e);}}
    };load();return()=>{cancelled=true;};
  },[symbol,timeframe]);

  const pointFromEvent=(e:{currentTarget:Element;clientX:number;clientY:number}):Point=>{const r=e.currentTarget.getBoundingClientRect();return{x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top))};};
  const finishTool=()=>{setDraftStart(null);setDraftEnd(null);setSelectedTool(null);};
  const handleToolPointerDown=(e:PointerEvent<HTMLDivElement>)=>{
    if(!selectedTool||showTools||showFibSettings)return;
    e.preventDefault();e.stopPropagation();setActiveDrawing(null);
    const p=pointFromEvent(e);
    if(selectedTool==="Horizontal line"||selectedTool==="Vertical line"){
      setDrawings(d=>[...d,{tool:selectedTool,a:p,b:p}]);finishTool();return;
    }
    setDraftStart(p);setDraftEnd(p);e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const handleToolPointerMove=(e:PointerEvent<HTMLDivElement>)=>{if(draftStart)setDraftEnd(pointFromEvent(e));};
  const handleToolPointerUp=(e:PointerEvent<HTMLDivElement>)=>{
    if(!draftStart)return;
    const b=pointFromEvent(e),dx=b.x-draftStart.x,dy=b.y-draftStart.y;
    if(Math.hypot(dx,dy)>=5)setDrawings(d=>[...d,{tool:selectedTool||"Trend line",a:draftStart,b}]);
    finishTool();
  };
  const cancelDrawing=()=>{setDraftStart(null);setDraftEnd(null);setSelectedTool(null);};
  const deleteDrawing=(index:number)=>{setDrawings(d=>d.filter((_,i)=>i!==index));setActiveDrawing(null);};

  const renderDrawing=(d:Drawing,i:number,interactive=false)=>{
    const {a,b,tool}=d;
    const common={stroke:"currentColor",vectorEffect:"non-scaling-stroke" as const};
    const hit=(children:React.ReactNode)=><g key={`hit-${i}`} onPointerDown={e=>{if(!interactive)return;e.stopPropagation();setActiveDrawing(i);}} style={interactive?{pointerEvents:"stroke"}:{pointerEvents:"none"}}>{children}</g>;
    if(tool==="Horizontal line")return <line key={i} x1="0" y1={a.y} x2="100%" y2={a.y} {...common} strokeWidth="1.4"/>;
    if(tool==="Vertical line")return <line key={i} x1={a.x} y1="0" x2={a.x} y2="100%" {...common} strokeWidth="1.4"/>;
    if(tool==="Rectangle"){
      const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y);
      return interactive?hit(<rect x={x} y={y} width={w} height={h} fill="none" stroke="transparent" strokeWidth="16"/>):<rect key={i} x={x} y={y} width={w} height={h} fill="none" {...common} strokeWidth="1.4"/>;
    }
    if(tool==="Fibonacci Retracement"){
      const levels=fibLevels.map(l=>a.y+(b.y-a.y)*l);
      if(interactive)return hit(<g>{levels.map((y,j)=><line key={j} x1="0" y1={y} x2="100%" y2={y} stroke="transparent" strokeWidth="14"/>)}</g>);
      return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...common} strokeWidth="1"/>{levels.map((y,j)=><g key={j}><line x1="0" y1={y} x2="100%" y2={y} {...common} strokeWidth="1" opacity=".65"/><text x="6" y={y-3} fontSize="10" fill="currentColor">{(fibLevels[j]*100).toFixed(fibLevels[j]%1===0?0:1)}%</text></g>)}</g>;
    }
    if(tool==="Ray"){
      const vx=b.x-a.x,vy=b.y-a.y,t=Math.max(1,(Math.max(containerRef.current?.clientWidth||1,containerRef.current?.clientHeight||1)*2)/Math.max(Math.abs(vx),Math.abs(vy),1));
      const ex=a.x+vx*t,ey=a.y+vy*t;
      return interactive?hit(<line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke="transparent" strokeWidth="16"/>):<line key={i} x1={a.x} y1={a.y} x2={ex} y2={ey} {...common} strokeWidth="1.4"/>;
    }
    return interactive?hit(<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="16"/>):<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...common} strokeWidth="1.4"/>;
  };
  const draft=draftStart&&draftEnd?{tool:selectedTool||"Trend line",a:draftStart,b:draftEnd}:null;
  const active=activeDrawing!==null?drawings[activeDrawing]:null;
  const toolbarPoint=active?{left:Math.min(Math.max(active.b.x,8),(containerRef.current?.clientWidth||260)-145),top:Math.max(8,Math.min(Math.max(active.a.y,active.b.y)+10,(containerRef.current?.clientHeight||300)-48))}:null;

  const saveFibLevels=(levels:number[])=>{const clean=levels.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);setFibLevels(clean);try{localStorage.setItem("jk-fib-levels",JSON.stringify(clean));window.dispatchEvent(new Event(FIB_EVENT));}catch{}};

  return <div className="w-full h-full relative border border-[#1a1a1a] bg-black light:bg-white" onPointerDown={()=>{if(!selectedTool)setActiveDrawing(null);}}>
    <div className="absolute top-2 left-2 z-30 flex items-center gap-1">
      <button type="button" onClick={e=>{e.stopPropagation();onSymbolClick?.();}} className="text-xs bg-black/70 px-2 py-1 rounded border border-[#333]">{symbol} · {timeframe}</button>
      <button type="button" onClick={e=>{e.stopPropagation();setShowTools(v=>!v);setActiveDrawing(null);}} className={`w-7 h-7 flex items-center justify-center rounded border ${showTools?"bg-white text-black border-white":"bg-black/70 text-[#aaa] border-[#333]"}`}><Wrench size={14}/></button>
    </div>
    <div ref={containerRef} className="w-full h-full" />

    <svg className="absolute inset-0 z-10 w-full h-full pointer-events-none text-white" aria-hidden="true">
      {drawings.map((d,i)=>renderDrawing(d,i,false))}
      {draft&&renderDrawing(draft,9999,false)}
    </svg>
    {!selectedTool&&drawings.length>0&&<svg className="absolute inset-0 z-[18] w-full h-full pointer-events-none text-white" aria-label="Drawing selection layer">
      {drawings.map((d,i)=>renderDrawing(d,i,true))}
    </svg>}
    {selectedTool&&<div className="absolute inset-0 z-20 cursor-crosshair touch-none" onPointerDown={handleToolPointerDown} onPointerMove={handleToolPointerMove} onPointerUp={handleToolPointerUp} onPointerCancel={cancelDrawing}/>} 

    {active&&toolbarPoint&&<div className="absolute z-50 flex items-center gap-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-1.5 py-1 shadow-2xl" style={{left:toolbarPoint.left,top:toolbarPoint.top}} onPointerDown={e=>e.stopPropagation()}>
      <button type="button" className="flex items-center gap-1 rounded px-2 py-1 text-xs text-white hover:bg-[#1a1a1a]" onClick={()=>setActiveDrawing(null)}><Pencil size={12}/> Edit</button>
      <button type="button" className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-300 hover:bg-[#1a1a1a]" onClick={()=>deleteDrawing(activeDrawing!)}><Trash2 size={12}/> Remove</button>
      <button type="button" className="rounded p-1 text-[#888] hover:bg-[#1a1a1a]" onClick={()=>setActiveDrawing(null)}><X size={12}/></button>
    </div>}
    {draftStart&&<div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 rounded bg-black/80 border border-[#333] px-2 py-1 text-[11px] text-white pointer-events-none">Drag to place {selectedTool}</div>}

    {showTools&&<div className="absolute top-11 left-2 z-40 w-56 rounded-lg border border-[#333] bg-[#0a0a0a] p-2 shadow-2xl"><div className="px-2 py-1 text-xs font-semibold text-[#888]">Drawing tools</div>{TOOLS.map(t=><button key={t} type="button" onClick={()=>{setSelectedTool(t);setShowTools(false);setActiveDrawing(null);cancelDrawing();setSelectedTool(t);}} className="w-full rounded px-2 py-2 text-left text-sm text-white hover:bg-[#1a1a1a]">{t}</button>)}<button type="button" onClick={()=>{setShowFibSettings(true);setShowTools(false);}} className="w-full rounded px-2 py-2 text-left text-sm text-[#aaa]">Fibonacci Settings</button><button type="button" onClick={()=>{setDrawings([]);setActiveDrawing(null);}} className="w-full mt-1 rounded px-2 py-2 text-left text-sm text-[#aaa]">Clear drawings</button></div>}
    {showFibSettings&&<div className="absolute top-11 left-2 z-50 w-64 rounded-lg border border-[#333] bg-[#0a0a0a] p-3 shadow-2xl"><div className="text-sm font-semibold text-white mb-2">Fibonacci Settings</div><div className="max-h-52 overflow-y-auto space-y-2">{fibLevels.map((l,i)=><div key={`${i}-${l}`} className="flex gap-2 items-center"><span className="text-xs text-[#aaa] w-5">{i+1}</span><input type="number" step="0.001" value={l} onChange={e=>{const n=[...fibLevels];n[i]=Number(e.target.value);setFibLevels(n);}} className="w-full rounded border border-[#333] bg-black px-2 py-1.5 text-sm text-white"/><button type="button" onClick={()=>setFibLevels(fibLevels.filter((_,j)=>j!==i))} className="text-[#888]">×</button></div>)}</div><div className="flex gap-2 mt-3"><button type="button" onClick={()=>setFibLevels([...fibLevels,1.618])} className="flex-1 rounded border border-[#333] px-2 py-2 text-xs text-white">+ 1.618</button><button type="button" onClick={()=>saveFibLevels(fibLevels)} className="flex-1 rounded bg-white px-2 py-2 text-xs text-black">Save</button></div><button type="button" onClick={()=>{setFibLevels(DEFAULT_FIB_LEVELS);saveFibLevels(DEFAULT_FIB_LEVELS);}} className="w-full mt-2 rounded border border-[#333] px-2 py-2 text-xs text-[#aaa]">Reset defaults</button><button type="button" onClick={()=>setShowFibSettings(false)} className="w-full mt-2 rounded border border-[#333] px-2 py-2 text-xs text-[#aaa]">Done</button></div>}
  </div>;
}
