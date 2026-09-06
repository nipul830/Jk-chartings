"use client";
import {useState} from "react";
import {Crosshair,Minus,MoveRight,Square,Triangle,Type,Trash2,ChevronDown,Ruler,GitBranch,PenLine} from "lucide-react";
import {DRAWING_CATEGORIES,DRAWING_TOOL_CATALOG} from "./DrawingToolCatalog";

const ICONS=[Crosshair,Minus,MoveRight,Square,Triangle,Type,Ruler,GitBranch,PenLine];
const QUICK=["Cross","Trend line","Ray","Horizontal line","Vertical line","Rectangle","Fibonacci retracement","Price range","Text"];

export function DrawingToolbar(){
 const [open,setOpen]=useState(false); const [active,setActive]=useState<string>("Cross");
 const choose=(name:string)=>{setActive(name);window.dispatchEvent(new CustomEvent("jk-drawing-tool",{detail:{tool:name}}));setOpen(false)};
 return <div className="absolute left-2 top-1/2 -translate-y-1/2 z-[80] flex flex-col rounded-lg border border-[#333] bg-[#080808]/95 shadow-2xl backdrop-blur-sm overflow-visible">
   {QUICK.map((name,i)=>{const I=ICONS[i];return <button key={name} type="button" title={name} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();choose(name)}} className={`w-9 h-9 flex items-center justify-center border-b border-[#222] last:border-0 ${active===name?"bg-[#222] text-white":"text-[#aaa] hover:bg-[#171717] hover:text-white"}`}><I size={16}/></button>})}
   <button type="button" title="More drawing tools" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setOpen(v=>!v)}} className="w-9 h-9 flex items-center justify-center text-[#aaa] hover:bg-[#171717] hover:text-white"><ChevronDown size={15}/></button>
   {open&&<div className="absolute left-11 top-0 w-64 max-h-[80vh] overflow-y-auto rounded-lg border border-[#333] bg-[#090909] shadow-2xl p-2">
     <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-[#777]">Drawing tools</div>
     {DRAWING_CATEGORIES.map(cat=><div key={cat} className="mb-2"><div className="px-2 py-1 text-xs font-semibold text-[#aaa]">{cat}</div>{DRAWING_TOOL_CATALOG.filter(x=>x.category===cat).map(t=><button key={`${cat}-${t.name}`} type="button" onClick={()=>choose(t.name)} className={`w-full rounded px-2 py-1.5 text-left text-xs ${active===t.name?"bg-[#222] text-white":"text-[#bbb] hover:bg-[#171717] hover:text-white"}`}>{t.name}</button>)}</div>)}
     <button type="button" onClick={()=>{window.dispatchEvent(new Event("jk-clear-drawings"));setOpen(false)}} className="sticky bottom-0 w-full mt-1 rounded border border-red-900/60 bg-[#120606] px-2 py-2 text-xs text-red-300 flex items-center gap-2"><Trash2 size={13}/> Clear drawings</button>
   </div>}
 </div>;
}
