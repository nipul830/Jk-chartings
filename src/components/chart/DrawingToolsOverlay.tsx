"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MutableRefObject } from "react";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";

type Point={x:number;y:number;time?:number;price?:number};
type Drawing={id:string;tool:string;points:Point[];color:string;width:number;text?:string};
type Props={chart:MutableRefObject<IChartApi|null>;series:MutableRefObject<ISeriesApi<"Candlestick">|null>;height:number};
const QUICK_TOOLS=[["Crosshair","cross"],["Trend line","trend"],["Ray","ray"],["Horizontal line","hline"],["Vertical line","vline"],["Fibonacci retracement","fib"],["Rectangle","rect"],["Circle","circle"],["Arrow","arrow"],["Brush","brush"],["Text","text"],["Measure","measure"]] as const;
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

class DrawingPrimitive{
 private chart:IChartApi|null=null;private series:ISeriesApi<"Candlestick">|null=null;private requestUpdate:(()=>void)|null=null;private drawings:Drawing[]=[];private draft:Drawing|null=null;
 attached(p:any){this.chart=p.chart;this.series=p.series;this.requestUpdate=p.requestUpdate}
 detached(){this.chart=null;this.series=null;this.requestUpdate=null}
 setDrawings(v:Drawing[]){this.drawings=v;this.requestUpdate?.()}
 setDraft(v:Drawing|null){this.draft=v;this.requestUpdate?.()}
 updateAllViews(){this.requestUpdate?.()}
 paneViews(){const self=this;return[{zOrder:()=>"top" as const,renderer:()=>({draw(target:any){target.useMediaCoordinateSpace(({context,mediaSize}:any)=>self.drawCanvas(context,mediaSize.width,mediaSize.height))}})}]}
 private xy(p:Point){let x=p.x,y=p.y;if(this.chart&&typeof p.time==="number"){const v=this.chart.timeScale().timeToCoordinate(p.time as Time);if(v!==null)x=v}if(this.series&&typeof p.price==="number"){const v=this.series.priceToCoordinate(p.price);if(v!==null)y=v}return{x,y}}
 private drawCanvas(ctx:CanvasRenderingContext2D,w:number,h:number){for(const d of this.draft?[...this.drawings,this.draft]:this.drawings)this.drawOne(ctx,w,h,d)}
 private drawOne(ctx:CanvasRenderingContext2D,w:number,h:number,d:Drawing){const p=d.points;if(!p.length)return;ctx.save();ctx.strokeStyle=d.color;ctx.fillStyle=d.color;ctx.lineWidth=d.width;ctx.lineCap="round";ctx.lineJoin="round";
  if(d.tool==="hline"){const a=this.xy(p[0]);ctx.beginPath();ctx.moveTo(0,a.y);ctx.lineTo(w,a.y);ctx.stroke()}
  else if(d.tool==="vline"){const a=this.xy(p[0]);ctx.beginPath();ctx.moveTo(a.x,0);ctx.lineTo(a.x,h);ctx.stroke()}
  else if(["trend","ray","measure"].includes(d.tool)&&p[1]){const a=this.xy(p[0]),b=this.xy(p[1]);let x2=b.x,y2=b.y;if(d.tool==="ray"){const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)<.0001){x2=a.x;y2=dy>=0?h:0}else{const k=(w-a.x)/dx;x2=a.x+dx*k;y2=a.y+dy*k}}ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(x2,y2);ctx.stroke();if(d.tool==="measure"){ctx.font="11px sans-serif";ctx.fillText(Math.abs((p[1].price??0)-(p[0].price??0)).toPrecision(5),(a.x+b.x)/2,(a.y+b.y)/2-6)}}
  else if(d.tool==="arrow"&&p[1]){const a=this.xy(p[0]),b=this.xy(p[1]),ang=Math.atan2(b.y-a.y,b.x-a.x),s=9;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.beginPath();ctx.moveTo(b.x-s*Math.cos(ang-Math.PI/6),b.y-s*Math.sin(ang-Math.PI/6));ctx.lineTo(b.x,b.y);ctx.lineTo(b.x-s*Math.cos(ang+Math.PI/6),b.y-s*Math.sin(ang+Math.PI/6));ctx.stroke()}
  else if(d.tool==="rect"&&p[1]){const a=this.xy(p[0]),b=this.xy(p[1]);ctx.strokeRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y))}
  else if(d.tool==="circle"&&p[1]){const a=this.xy(p[0]),b=this.xy(p[1]);ctx.beginPath();ctx.ellipse((a.x+b.x)/2,(a.y+b.y)/2,Math.abs(b.x-a.x)/2,Math.abs(b.y-a.y)/2,0,0,Math.PI*2);ctx.stroke()}
  else if(d.tool==="fib"&&p[1]){const a=p[0],b=p[1],pa=a.price??0,pb=b.price??0,levels=[0,.236,.382,.5,.618,.786,1];ctx.font="10px sans-serif";for(const l of levels){const y=this.xy({x:a.x,y:a.y,price:pa+(pb-pa)*l}).y;ctx.globalAlpha=.75;ctx.lineWidth=l===0||l===1?d.width:1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();ctx.globalAlpha=1;ctx.fillText(`${(l*100).toFixed(1)}%`,6,y-3)}}
  else if(d.tool==="text"){const a=this.xy(p[0]);ctx.font="600 12px sans-serif";ctx.fillText(d.text||"Note",a.x+6,a.y-6)}
  else if(d.tool==="brush"&&p.length>1){ctx.beginPath();const a=this.xy(p[0]);ctx.moveTo(a.x,a.y);for(let i=1;i<p.length;i++){const q=this.xy(p[i]);ctx.lineTo(q.x,q.y)}ctx.stroke()}
  ctx.restore()}
}

export function DrawingToolsOverlay({chart,series,height}:Props){
 const host=useRef<HTMLDivElement>(null);const primitive=useRef<DrawingPrimitive|null>(null);const attachTimer=useRef<number|null>(null);const[open,setOpen]=useState(false);const[active,setActive]=useState("cross");const[drawings,setDrawings]=useState<Drawing[]>([]);const[draft,setDraft]=useState<Point[]>([]);const[cursor,setCursor]=useState<Point|null>(null);const[color,setColor]=useState("#f5f5f5");const[width,setWidth]=useState(2);const drawing=active!=="cross";
 useEffect(()=>{try{const s=JSON.parse(localStorage.getItem("jk-drawings")||"[]");if(Array.isArray(s))setDrawings(s)}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem("jk-drawings",JSON.stringify(drawings))}catch{}},[drawings]);
 useEffect(()=>{let stopped=false;const attach=()=>{if(stopped)return;const s=series.current;if(s){const p=new DrawingPrimitive();primitive.current=p;s.attachPrimitive(p as any);p.setDrawings(drawings);return}attachTimer.current=requestAnimationFrame(attach)};attach();return()=>{stopped=true;if(attachTimer.current!==null)cancelAnimationFrame(attachTimer.current);const s=series.current,p=primitive.current;if(s&&p){try{s.detachPrimitive(p as any)}catch{}}primitive.current=null}},[chart,series]);
 useEffect(()=>{primitive.current?.setDrawings(drawings)},[drawings]);
 useEffect(()=>{primitive.current?.setDraft(draft.length?{id:"draft",tool:active,points:draft.concat(cursor&&active!=="brush"?[cursor]:[]),color,width}:null)},[draft,cursor,active,color,width]);
 const toPoint=(e:ReactPointerEvent):Point|null=>{const r=host.current?.getBoundingClientRect(),c=chart.current,s=series.current;if(!r||!c||!s)return null;const x=Math.max(0,Math.min(r.width,e.clientX-r.left)),y=Math.max(0,Math.min(r.height,e.clientY-r.top)),t=c.timeScale().coordinateToTime(x),p=s.coordinateToPrice(y);return{x,y,time:typeof t==="number"?t:undefined,price:p===null?undefined:p}};
 const finish=(points:Point[])=>{const need=["hline","vline","text"].includes(active)?1:2;if(points.length<need)return;setDrawings(v=>[...v,{id:uid(),tool:active,points,color,width,text:active==="text"?"Note":undefined}]);setDraft([]);if(active!=="brush")setActive("cross")};
 const down=(e:ReactPointerEvent)=>{if(!drawing)return;e.currentTarget.setPointerCapture(e.pointerId);const p=toPoint(e);if(!p)return;if(["hline","vline","text"].includes(active))finish([p]);else setDraft([p])};
 const move=(e:ReactPointerEvent)=>{const p=toPoint(e);if(!p)return;setCursor(p);if(active==="brush"&&draft.length)setDraft(v=>[...v,p])};
 const up=(e:ReactPointerEvent)=>{if(!drawing||active==="brush")return;const p=toPoint(e);if(p&&draft.length)finish([...draft,p])};
 const menu=useMemo(()=>QUICK_TOOLS,[]);
 return <><div className="absolute top-12 left-2 z-[75]"><button onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setOpen(v=>!v)}} className="rounded-md border border-[#333] bg-black/90 px-2 py-1 text-[11px] font-semibold text-white shadow-lg hover:bg-[#151515]">Tools</button>{open&&<div onPointerDown={e=>e.stopPropagation()} className="absolute left-0 top-8 w-56 rounded-lg border border-[#333] bg-[#090909]/98 p-2 shadow-2xl backdrop-blur"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-[#888]">Drawing tools</span><div className="flex gap-1"><button onClick={()=>setDrawings(v=>v.slice(0,-1))} className="rounded border border-[#333] px-1.5 py-0.5 text-[10px] text-white">Undo</button><button onClick={()=>{setDrawings([]);setDraft([])}} className="rounded border border-[#333] px-1.5 py-0.5 text-[10px] text-white">Clear</button></div></div><div className="grid grid-cols-2 gap-1">{menu.map(([label,id])=><button key={id} onClick={()=>{setActive(id);setOpen(false);setDraft([])}} className={`rounded px-2 py-1.5 text-left text-[10px] ${active===id?"bg-white text-black":"text-[#ddd] hover:bg-[#1c1c1c]"}`}>{label}</button>)}</div><div className="mt-2 flex items-center gap-2 border-t border-[#222] pt-2"><input aria-label="Tool color" type="color" value={color} onChange={e=>setColor(e.target.value)} className="h-6 w-7 cursor-pointer bg-transparent"/><select value={width} onChange={e=>setWidth(+e.target.value)} className="rounded border border-[#333] bg-black px-1 py-1 text-[10px] text-white"><option value={1}>1 px</option><option value={2}>2 px</option><option value={3}>3 px</option><option value={4}>4 px</option></select><span className="text-[10px] text-[#777]">Line width</span></div></div>}</div><div ref={host} className={`absolute inset-0 z-[50] ${drawing?"cursor-crosshair":"pointer-events-none"}`} style={{height,touchAction:drawing?"none":"auto"}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>setDraft([])}/></>;
}
