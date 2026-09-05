"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { Wrench, Trash2, X } from "lucide-react";

interface ChartPaneProps { symbol: string; timeframe: string; height?: number; onSymbolClick?: () => void; }
type Point = { x: number; y: number };
type Drawing = { tool: string; a: Point; b: Point };
type EditState = { index: number; mode: "move" | "resizeA" | "resizeB"; start: Point; orig: Drawing };

const intervalMap: Record<string, string> = { "1m":"1m", "5m":"5m", "15m":"15m", "1H":"1h", "4H":"4h", "1D":"1d" };
const defaultUp="#ffffff", defaultDown="#666666";
const COLOR_EVENT="jk-candle-colors-changed", FIB_EVENT="jk-fib-settings-changed";
const DEFAULT_FIB_LEVELS=[0,.236,.382,.5,.618,.786,1];
const TOOLS=["Trend line","Horizontal line","Vertical line","Ray","Rectangle","Fibonacci Retracement"];

function getCandleColors(){
  if(typeof window==="undefined") return {up:defaultUp,down:defaultDown};
  try{const s=localStorage.getItem("jk-candle-colors");if(s){const p=JSON.parse(s);if(p?.up&&p?.down)return {up:p.up,down:p.down};}}catch{}
  return {up:defaultUp,down:defaultDown};
}
function getFibLevels(){
  if(typeof window==="undefined") return DEFAULT_FIB_LEVELS;
  try{const s=localStorage.getItem("jk-fib-levels");if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length)return p.map(Number).filter(Number.isFinite);}}catch{}
  return DEFAULT_FIB_LEVELS;
}

export function ChartPane({symbol,timeframe,height=400,onSymbolClick}:ChartPaneProps){
  const containerRef=useRef<HTMLDivElement>(null),chartRef=useRef<IChartApi|null>(null),seriesRef=useRef<ISeriesApi<"Candlestick">|null>(null);
  const colorsRef=useRef(getCandleColors());
  const [showTools,setShowTools]=useState(false),[selectedTool,setSelectedTool]=useState<string|null>(null);
  const [showFibSettings,setShowFibSettings]=useState(false),[fibLevels,setFibLevels]=useState<number[]>(getFibLevels());
  const [drawings,setDrawings]=useState<Drawing[]>([]),[draftStart,setDraftStart]=useState<Point|null>(null),[draftEnd,setDraftEnd]=useState<Point|null>(null);
  const [activeDrawing,setActiveDrawing]=useState<number|null>(null),[editState,setEditState]=useState<EditState|null>(null);
  const [cursorPoint,setCursorPoint]=useState<Point|null>(null);

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
    const ro=new ResizeObserver(()=>containerRef.current&&chart.applyOptions({width:Math.max(1,containerRef.current.clientWidth),height}));ro.observe(containerRef.current);
    window.addEventListener(COLOR_EVENT,colorChange);window.addEventListener(FIB_EVENT,fibChange);
    return()=>{mo.disconnect();ro.disconnect();window.removeEventListener(COLOR_EVENT,colorChange);window.removeEventListener(FIB_EVENT,fibChange);chart.remove();chartRef.current=null;seriesRef.current=null;};
  },[height]);

  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{if(!seriesRef.current)return;const interval=intervalMap[timeframe]||"15m";const url=`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`;
      for(let i=0;i<3&&!cancelled;i++){try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error(`HTTP ${r.status}`);const raw=await r.json();if(!Array.isArray(raw)||!raw.length)throw Error("No data");const data:CandlestickData[]=raw.map((k:any)=>({time:Math.floor(k[0]/1000) as any,open:+k[1],high:+k[2],low:+k[3],close:+k[4]}));if(!cancelled&&seriesRef.current){seriesRef.current.setData(data);chartRef.current?.timeScale().fitContent();}return;}catch(e){if(i<2)await new Promise(r=>setTimeout(r,500*(i+1)));else console.error(e);}}
    };load();return()=>{cancelled=true;};
  },[symbol,timeframe]);

  const point=(e:{currentTarget:Element;clientX:number;clientY:number}):Point=>{const r=e.currentTarget.getBoundingClientRect();return{x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top))};};
  const finishPlacement=()=>{setDraftStart(null);setDraftEnd(null);setSelectedTool(null);setCursorPoint(null);};

  useEffect(()=>{
    if(!selectedTool)return;
    const el=containerRef.current;
    if(!el)return;
    const w=el.clientWidth,h=el.clientHeight;
    setCursorPoint(p=>p||{x:w/2,y:h/2});
    chartRef.current?.applyOptions({handleScroll:false,handleScale:false,crosshair:{mode:0}});
    return()=>{chartRef.current?.applyOptions({handleScroll:true,handleScale:true,crosshair:{mode:0}});};
  },[selectedTool]);

  const handlePointerMove=(e:PointerEvent<HTMLDivElement>)=>{
    if(!selectedTool)return;
    const p=point(e);setCursorPoint(p);
    if(draftStart)setDraftEnd(p);
  };
  const handlePlacementTap=(e:PointerEvent<HTMLDivElement>)=>{
    if(!selectedTool||showTools||showFibSettings)return;
    e.preventDefault();e.stopPropagation();
    const p=point(e);setCursorPoint(p);
    if(!draftStart){setActiveDrawing(null);setDraftStart(p);setDraftEnd(p);return;}
    if(Math.hypot(p.x-draftStart.x,p.y-draftStart.y)<3)return;
    const tool=selectedTool;
    const start=draftStart;
    setDrawings(d=>[...d,{tool,a:start,b:p}]);
    finishPlacement();
  };

  const beginEdit=(index:number,mode:"move"|"resizeA"|"resizeB",e:PointerEvent<SVGElement>)=>{
    e.preventDefault();e.stopPropagation();
    const p=point(e),d=drawings[index];
    setActiveDrawing(index);setEditState({index,mode,start:p,orig:{...d,a:{...d.a},b:{...d.b}}});
    (e.currentTarget as SVGElement).setPointerCapture?.(e.pointerId);
  };
  const editMove=(e:PointerEvent<SVGElement>)=>{
    if(!editState)return;
    const p=point(e),dx=p.x-editState.start.x,dy=p.y-editState.start.y,o=editState.orig;
    setDrawings(d=>d.map((x,i)=>{
      if(i!==editState.index)return x;
      if(editState.mode==="resizeA")return {...x,a:{x:o.a.x+dx,y:o.a.y+dy}};
      if(editState.mode==="resizeB")return {...x,b:{x:o.b.x+dx,y:o.b.y+dy}};
      return {...x,a:{x:o.a.x+dx,y:o.a.y+dy},b:{x:o.b.x+dx,y:o.b.y+dy}};
    }));
  };
  const editUp=()=>setEditState(null);

  const shape=(d:Drawing,interactive=false,i=0)=>{
    const {a,b,tool}=d;
    const hit=(mode:"move"|"resizeA"|"resizeB")=>interactive?{onPointerDown:(e:PointerEvent<SVGElement>)=>beginEdit(i,mode,e),style:{pointerEvents:"stroke" as const,cursor:mode==="move"?"move":"crosshair"}}:{};
    if(tool==="Horizontal line")return <line key={`${i}-h`} x1="0" y1={a.y} x2="100%" y2={a.y} stroke={interactive?"transparent":"currentColor"} strokeWidth={interactive?18:1.4} {...hit("resizeA")}/>;
    if(tool==="Vertical line")return <line key={`${i}-v`} x1={a.x} y1="0" x2={a.x} y2="100%" stroke={interactive?"transparent":"currentColor"} strokeWidth={interactive?18:1.4} {...hit("resizeA")}/>;
    if(tool==="Rectangle"){const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y);return <rect key={`${i}-r`} x={x} y={y} width={w} height={h} fill="none" stroke={interactive?"transparent":"currentColor"} strokeWidth={interactive?18:1.4} {...hit("move")}/>;}
    if(tool==="Fibonacci Retracement"){
      const ys=fibLevels.map(l=>a.y+(b.y-a.y)*l);
      return <g key={`${i}-fib`}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={interactive?"transparent":"currentColor"} strokeWidth={interactive?18:1}/>
        {!interactive&&ys.map((y,j)=><g key={j}><line x1="0" y1={y} x2="100%" y2={y} stroke="currentColor" strokeWidth="1" opacity=".65"/><text x="6" y={y-3} fontSize="10" fill="currentColor">{(fibLevels[j]*100).toFixed(fibLevels[j]%1===0?0:1)}%</text></g>)}
        {interactive&&<line x1="0" y1={a.y} x2="100%" y2={a.y} stroke="transparent" strokeWidth="18" style={{pointerEvents:"stroke"}} onPointerDown={e=>beginEdit(i,"move",e)}/>} 
      </g>;
    }
    if(tool==="Ray"){
      const vx=b.x-a.x,vy=b.y-a.y,t=Math.max(1,(Math.max(containerRef.current?.clientWidth||1,containerRef.current?.clientHeight||1)*2)/Math.max(Math.abs(vx),Math.abs(vy),1)),ex=a.x+vx*t,ey=a.y+vy*t;
      return <line key={`${i}-ray`} x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={interactive?"transparent":"currentColor"} strokeWidth={interactive?18:1.4} {...hit("move")}/>;
    }
    return <line key={`${i}-line`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={interactive?"transparent":"currentColor"} strokeWidth={interactive?18:1.4} {...hit("move")}/>;
  };

  const active=activeDrawing!==null?drawings[activeDrawing]:null;
  const toolbar=active?{left:Math.min(Math.max(active.b.x,8),(containerRef.current?.clientWidth||300)-190),top:Math.max(8,Math.min(Math.max(active.a.y,active.b.y)+14,(containerRef.current?.clientHeight||300)-50))}:null;
  const saveFib=(levels:number[])=>{const clean=levels.map(Number).filter(Number.isFinite).sort((a,b)=>a-b);setFibLevels(clean);try{localStorage.setItem("jk-fib-levels",JSON.stringify(clean));window.dispatchEvent(new Event(FIB_EVENT));}catch{}};

  return <div className="w-full h-full relative border border-[#1a1a1a] bg-black light:bg-white" onPointerMove={handlePointerMove} onPointerDown={handlePlacementTap}>
    <div className="absolute top-2 left-2 z-40 flex items-center gap-1">
      <button type="button" onClick={e=>{e.stopPropagation();onSymbolClick?.();}} className="text-xs bg-black/70 px-2 py-1 rounded border border-[#333]">{symbol} · {timeframe}</button>
      <button type="button" onClick={e=>{e.stopPropagation();setShowTools(v=>!v);setActiveDrawing(null);setSelectedTool(null);setDraftStart(null);setDraftEnd(null);setCursorPoint(null);}} className={`w-7 h-7 flex items-center justify-center rounded border ${showTools?"bg-white text-black border-white":"bg-black/70 text-[#aaa] border-[#333]"}`}><Wrench size={14}/></button>
    </div>
    <div ref={containerRef} className="w-full h-full" />

    {selectedTool&&cursorPoint&&<div className="absolute inset-0 z-20 pointer-events-none" aria-hidden="true">
      <div className="absolute top-0 bottom-0 w-px bg-white/70" style={{left:cursorPoint.x}} />
      <div className="absolute left-0 right-0 h-px bg-white/70" style={{top:cursorPoint.y}} />
      <div className="absolute w-3 h-3 rounded-full border-2 border-white bg-black -translate-x-1/2 -translate-y-1/2" style={{left:cursorPoint.x,top:cursorPoint.y}} />
    </div>}

    <svg className="absolute inset-0 z-10 w-full h-full pointer-events-none text-white" aria-hidden="true">
      {drawings.map((d,i)=>shape(d,false,i))}
      {draftStart&&draftEnd&&shape({tool:selectedTool||"Trend line",a:draftStart,b:draftEnd},false,9999)}
      {active&&<g style={{pointerEvents:"auto"}}>
        {active.tool==="Horizontal line"&&<circle cx={active.a.x} cy={active.a.y} r="7" fill="black" stroke="white" strokeWidth="2" onPointerDown={e=>beginEdit(activeDrawing!,"resizeA",e)}/>} 
        {active.tool==="Vertical line"&&<circle cx={active.a.x} cy={active.a.y} r="7" fill="black" stroke="white" strokeWidth="2" onPointerDown={e=>beginEdit(activeDrawing!,"resizeA",e)}/>} 
        {active.tool!=="Horizontal line"&&active.tool!=="Vertical line"&&<>
          <circle cx={active.a.x} cy={active.a.y} r="7" fill="black" stroke="white" strokeWidth="2" onPointerDown={e=>beginEdit(activeDrawing!,"resizeA",e)}/>
          <circle cx={active.b.x} cy={active.b.y} r="7" fill="black" stroke="white" strokeWidth="2" onPointerDown={e=>beginEdit(activeDrawing!,"resizeB",e)}/>
        </>}
      </g>}
    </svg>

    {!selectedTool&&drawings.length>0&&<svg className="absolute inset-0 z-[18] w-full h-full pointer-events-none text-white" aria-label="Drawing selection layer" onPointerMove={editMove} onPointerUp={editUp} onPointerCancel={editUp}>
      {drawings.map((d,i)=>shape(d,true,i))}
    </svg>}

    {active&&toolbar&&<div className="absolute z-50 flex items-center gap-1 rounded-lg border border-[#333] bg-[#0a0a0a] px-1.5 py-1 shadow-2xl" style={{left:toolbar.left,top:toolbar.top}} onPointerDown={e=>e.stopPropagation()}>
      <span className="px-1 text-[10px] text-[#888]">Drag handles to resize</span>
      <button type="button" className="rounded px-2 py-1 text-xs text-white hover:bg-[#1a1a1a]" onClick={()=>setActiveDrawing(null)}>Done</button>
      <button type="button" className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-300 hover:bg-[#1a1a1a]" onClick={()=>{setDrawings(d=>d.filter((_,j)=>j!==activeDrawing));setActiveDrawing(null);}}><Trash2 size={12}/> Remove</button>
      <button type="button" className="rounded p-1 text-[#888] hover:bg-[#1a1a1a]" onClick={()=>setActiveDrawing(null)}><X size={12}/></button>
    </div>}

    {draftStart&&<div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 rounded bg-black/80 border border-[#333] px-2 py-1 text-[11px] text-white pointer-events-none">Crosshair: tap start → move crosshair → tap end</div>}

    {showTools&&<div className="absolute top-11 left-2 z-40 w-56 rounded-lg border border-[#333] bg-[#0a0a0a] p-2 shadow-2xl">
      <div className="px-2 py-1 text-xs font-semibold text-[#888]">Drawing tools</div>
      {TOOLS.map(t=><button key={t} type="button" onClick={()=>{setShowTools(false);setActiveDrawing(null);setDraftStart(null);setDraftEnd(null);setCursorPoint(null);setSelectedTool(t);}} className="w-full rounded px-2 py-2 text-left text-sm text-white hover:bg-[#1a1a1a]">{t}</button>)}
      <button type="button" onClick={()=>{setShowFibSettings(true);setShowTools(false);}} className="w-full rounded px-2 py-2 text-left text-sm text-[#aaa]">Fibonacci Settings</button>
      <button type="button" onClick={()=>{setDrawings([]);setActiveDrawing(null);}} className="w-full mt-1 rounded px-2 py-2 text-left text-sm text-[#aaa]">Clear drawings</button>
    </div>}

    {showFibSettings&&<div className="absolute top-11 left-2 z-50 w-64 rounded-lg border border-[#333] bg-[#0a0a0a] p-3 shadow-2xl">
      <div className="text-sm font-semibold text-white mb-2">Fibonacci Settings</div>
      <div className="max-h-52 overflow-y-auto space-y-2">{fibLevels.map((l,i)=><div key={`${i}-${l}`} className="flex gap-2 items-center"><span className="text-xs text-[#aaa] w-5">{i+1}</span><input type="number" step="0.001" value={l} onChange={e=>{const n=[...fibLevels];n[i]=Number(e.target.value);setFibLevels(n);}} className="w-full rounded border border-[#333] bg-black px-2 py-1.5 text-sm text-white"/><button type="button" onClick={()=>setFibLevels(fibLevels.filter((_,j)=>j!==i))} className="text-[#888]">×</button></div>)}</div>
      <div className="flex gap-2 mt-3"><button type="button" onClick={()=>setFibLevels([...fibLevels,1.618])} className="flex-1 rounded border border-[#333] px-2 py-2 text-xs text-white">+ 1.618</button><button type="button" onClick={()=>saveFib(fibLevels)} className="flex-1 rounded bg-white px-2 py-2 text-xs text-black">Save</button></div>
      <button type="button" onClick={()=>{setFibLevels(DEFAULT_FIB_LEVELS);saveFib(DEFAULT_FIB_LEVELS);}} className="w-full mt-2 rounded border border-[#333] px-2 py-2 text-xs text-[#aaa]">Reset defaults</button>
      <button type="button" onClick={()=>setShowFibSettings(false)} className="w-full mt-2 rounded border border-[#333] px-2 py-2 text-xs text-[#aaa]">Done</button>
    </div>}
  </div>;
}
