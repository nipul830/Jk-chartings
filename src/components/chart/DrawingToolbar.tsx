"use client";
import {useEffect,useRef,useState} from "react";
import {Crosshair,Minus,MoveRight,Square,Triangle,Type,Trash2,ChevronDown,Ruler,GitBranch,PenLine,Circle,Undo2} from "lucide-react";
import {DRAWING_CATEGORIES,DRAWING_TOOL_CATALOG} from "./DrawingToolCatalog";

type Pt={x:number;y:number}; type Draw={tool:string;a:Pt;b?:Pt;text?:string};
const QUICK=["Cross","Trend line","Ray","Horizontal line","Vertical line","Rectangle","Fibonacci retracement","Price range","Text"];
const ICONS=[Crosshair,Minus,MoveRight,Square,Triangle,Type,Ruler,GitBranch,PenLine];
const DEF=[0,.236,.382,.5,.618,.786,1];
const twoPoint=(tool:string)=>!["Horizontal line","Vertical line","Cross","Dot","Text","Arrow marker","Arrow marks","Magic","Eraser"].includes(tool);

export function DrawingToolbar(){
 const [open,setOpen]=useState(false),[active,setActive]=useState("Cross"),[drawings,setDrawings]=useState<Draw[]>([]),[draft,setDraft]=useState<Pt|null>(null),[cursor,setCursor]=useState<Pt|null>(null); const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{const clear=()=>{setDrawings([]);setDraft(null)};window.addEventListener("jk-clear-drawings",clear);return()=>window.removeEventListener("jk-clear-drawings",clear)},[]);
 const point=(e:{clientX:number;clientY:number})=>{const r=box.current?.getBoundingClientRect();return r?{x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top))}:null};
 const choose=(name:string)=>{setActive(name);setOpen(false);setDraft(null)};
 const down=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.target instanceof HTMLElement&&e.target.closest("button"))return;if(active==="Eraser"){const p=point(e);if(p)setDrawings(ds=>ds.slice(0,-1));return}const p=point(e);if(!p)return;e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);setCursor(p);if(!twoPoint(active)){setDrawings(ds=>[...ds,{tool:active,a:p,b:p}]);return}setDraft(p)};
 const move=(e:React.PointerEvent<HTMLDivElement>)=>{const p=point(e);if(!p)return;setCursor(p);if(draft)setCursor(p)};
 const up=(e:React.PointerEvent<HTMLDivElement>)=>{if(!draft)return;const p=point(e);if(!p)return;setDrawings(ds=>[...ds,{tool:active,a:draft,b:p}]);setDraft(null)};
 const line=(d:Draw,i:number)=>{const a=d.a,b=d.b||d.a;const common={key:i,stroke:"#ffffff",strokeWidth:1.5,fill:"none",vectorEffect:"non-scaling-stroke" as const};if(d.tool==="Horizontal line")return <line {...common} x1={0} y1={a.y} x2="100%" y2={a.y}/>;if(d.tool==="Vertical line")return <line {...common} x1={a.x} y1={0} x2={a.x} y2="100%"/>;if(d.tool==="Cross")return <g key={i}><line {...common} x1={a.x-10} y1={a.y} x2={a.x+10} y2={a.y}/><line {...common} x1={a.x} y1={a.y-10} x2={a.x} y2={a.y+10}/></g>;if(d.tool==="Rectangle"||d.tool==="Gann box")return <rect {...common} x={Math.min(a.x,b.x)} y={Math.min(a.y,b.y)} width={Math.abs(b.x-a.x)} height={Math.abs(b.y-a.y)}/>;if(d.tool==="Circle"||d.tool==="Ellipse")return <ellipse {...common} cx={(a.x+b.x)/2} cy={(a.y+b.y)/2} rx={Math.abs(b.x-a.x)/2} ry={Math.abs(b.y-a.y)/2}/>;if(d.tool==="Triangle")return <polygon {...common} points={`${a.x},${b.y} ${(a.x+b.x)/2},${a.y} ${b.x},${b.y}`}/>;if(d.tool==="Fibonacci retracement"){return <g key={i}><line {...common} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>{DEF.map((l,j)=>{const y=a.y+(b.y-a.y)*l;return <g key={j}><line x1={a.x} y1={y} x2={b.x} y2={y} stroke="#aaa" strokeWidth={1}/><text x={b.x+5} y={y-3} fill="#aaa" fontSize={10}>{Math.round(l*100)}%</text></g>})}</g>};if(d.tool==="Arrow"||d.tool==="Trend line"||d.tool==="Info line"||d.tool==="Extended line"||d.tool==="Trend angle"||d.tool==="Ray"||d.tool==="Arrow marker"||d.tool==="Price range"||d.tool==="Date range"||d.tool==="Date and price range"||d.tool==="Parallel channel"||d.tool==="Regression trend"||d.tool==="Pitchfan"||d.tool==="Gann fan")return <line {...common} x1={a.x} y1={a.y} x2={d.tool==="Ray"?a.x+(b.x-a.x)*4:b.x} y2={d.tool==="Ray"?a.y+(b.y-a.y)*4:b.y}/>;if(d.tool==="Crossline")return <g key={i}><line {...common} x1={0} y1={a.y} x2="100%" y2={a.y}/><line {...common} x1={a.x} y1={0} x2={a.x} y2="100%"/></g>;if(d.tool==="Text"||d.tool==="Note"||d.tool==="Anchored note"||d.tool==="Price note"||d.tool==="Comment"||d.tool==="Callout")return <text key={i} x={a.x} y={a.y} fill="#fff" fontSize={12}>{d.text||d.tool}</text>;return <line {...common} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>};
 const preview=draft&&cursor?line({tool:active,a:draft,b:cursor},999):null;
 return <div ref={box} className="absolute inset-0 z-[75] pointer-events-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>setDraft(null)} style={{touchAction:active?"none":"auto"}}>
  <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col rounded-lg border border-[#333] bg-[#080808]/95 shadow-2xl backdrop-blur-sm overflow-visible">
   {QUICK.map((name,i)=>{const I=ICONS[i];return <button key={name} type="button" title={name} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();choose(name)}} className={`w-9 h-9 flex items-center justify-center border-b border-[#222] ${active===name?"bg-[#222] text-white":"text-[#aaa] hover:bg-[#171717] hover:text-white"}`}><I size={16}/></button>})}
   <button type="button" title="Undo" onClick={()=>setDrawings(ds=>ds.slice(0,-1))} className="w-9 h-8 flex items-center justify-center border-b border-[#222] text-[#aaa] hover:text-white"><Undo2 size={15}/></button>
   <button type="button" title="More drawing tools" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setOpen(v=>!v)}} className="w-9 h-9 flex items-center justify-center text-[#aaa] hover:bg-[#171717] hover:text-white"><ChevronDown size={15}/></button>
   {open&&<div className="absolute left-11 top-0 w-64 max-h-[80vh] overflow-y-auto rounded-lg border border-[#333] bg-[#090909] shadow-2xl p-2 pointer-events-auto">
     <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-[#777]">All drawing tools</div>
     {DRAWING_CATEGORIES.map(cat=><div key={cat} className="mb-2"><div className="px-2 py-1 text-xs font-semibold text-[#aaa]">{cat}</div>{DRAWING_TOOL_CATALOG.filter(x=>x.category===cat).map(t=><button key={`${cat}-${t.name}`} type="button" onClick={()=>choose(t.name)} className={`w-full rounded px-2 py-1.5 text-left text-xs ${active===t.name?"bg-[#222] text-white":"text-[#bbb] hover:bg-[#171717] hover:text-white"}`}>{t.name}</button>)}</div>)}
     <button type="button" onClick={()=>{setDrawings([]);setOpen(false)}} className="sticky bottom-0 w-full mt-1 rounded border border-red-900/60 bg-[#120606] px-2 py-2 text-xs text-red-300 flex items-center gap-2"><Trash2 size={13}/> Clear drawings</button>
   </div>}
  </div>
  {(drawings.length>0||preview)&&<svg className="absolute inset-0 w-full h-full pointer-events-none text-white">{drawings.map(line)}{preview}</svg>}
  {active&&cursor&&<div className="absolute pointer-events-none" style={{left:cursor.x,top:cursor.y}}><div className="absolute -left-3 -top-px w-6 h-px bg-white/70"/><div className="absolute -top-3 -left-px w-px h-6 bg-white/70"/></div>}
 </div>;
}
