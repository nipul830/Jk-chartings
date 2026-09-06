"use client";
import {useEffect,useState} from "react";
import {Check,ChevronDown,Settings2,X} from "lucide-react";

export const INDICATORS=["Moving Average","EMA","SMA","Bollinger Bands","VWAP","RSI","MACD","Stochastic","ATR","ADX","CCI","Williams %R","Volume","Volume Profile"];
const defaults:Record<string,Record<string,number>>={
  "Moving Average":{length:20},EMA:{length:20},SMA:{length:20},"Bollinger Bands":{length:20,mult:2},VWAP:{},RSI:{length:14},MACD:{fast:12,slow:26,signal:9},Stochastic:{length:14,smooth:3},ATR:{length:14},ADX:{length:14},CCI:{length:20},"Williams %R":{length:14},Volume:{},"Volume Profile":{}
};
export function IndicatorMenu(){
 const[open,setOpen]=useState(false),[selected,setSelected]=useState<string[]>([]),[edit,setEdit]=useState<string|null>(null),[cfg,setCfg]=useState<Record<string,number>>({});
 useEffect(()=>{try{const a=JSON.parse(localStorage.getItem("jk-indicators")||"[]");setSelected(Array.isArray(a)?a:[])}catch{}},[]);
 const emit=()=>window.dispatchEvent(new Event("jk-indicators-changed"));
 const toggle=(name:string)=>{const next=selected.includes(name)?selected.filter(x=>x!==name):[...selected,name];setSelected(next);localStorage.setItem("jk-indicators",JSON.stringify(next));if(!next.includes(name)&&edit===name)setEdit(null);emit()};
 const startEdit=(name:string)=>{let saved:any={};try{const all=JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}");saved=all[name]||{}}catch{}setCfg({...defaults[name],...saved});setEdit(name)};
 const save=()=>{if(!edit)return;let all:any={};try{all=JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}")}catch{}all[edit]=cfg;localStorage.setItem("jk-indicator-settings",JSON.stringify(all));emit();setEdit(null)};
 return <div className="relative">
  <button type="button" onClick={()=>setOpen(v=>!v)} className="h-9 px-3 rounded-md border border-[#333] bg-[#0a0a0a] text-sm text-white flex items-center gap-2 hover:border-white"><span>Indicators</span>{selected.length>0&&<span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-black">{selected.length}</span>}<ChevronDown size={14}/></button>
  {open&&<div className="absolute right-0 top-11 z-[200] w-[min(380px,calc(100vw-24px))] rounded-xl border border-[#333] bg-[#080808] shadow-2xl overflow-hidden">
   <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]"><div><div className="font-medium">Indicators</div><div className="text-[11px] text-[#666]">Tap an indicator to edit its settings</div></div><button onClick={()=>setOpen(false)} className="text-[#888] hover:text-white"><X size={17}/></button></div>
   <div className="max-h-[55vh] overflow-y-auto p-2">{INDICATORS.map(name=><div key={name} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${selected.includes(name)?"bg-[#101010]":"hover:bg-[#111]"}`}>
    <button onClick={()=>toggle(name)} className="w-8 h-8 flex items-center justify-center rounded-md" title={selected.includes(name)?"Remove indicator":"Add indicator"}><span className={`w-5 h-5 rounded border flex items-center justify-center ${selected.includes(name)?"bg-white text-black border-white":"border-[#444] text-transparent"}`}><Check size={13}/></span></button>
    <button onClick={()=>selected.includes(name)?startEdit(name):toggle(name)} className="flex-1 text-left text-sm text-white py-1">{name}</button>
    {selected.includes(name)&&<button title={`Edit ${name}`} onClick={()=>startEdit(name)} className="w-8 h-8 flex items-center justify-center rounded border border-[#333] text-[#aaa] hover:text-white hover:border-white"><Settings2 size={15}/></button>}
   </div>)}</div>
   {edit&&<div className="border-t border-[#222] p-4 bg-[#0c0c0c]"><div className="flex items-center justify-between mb-3"><div className="font-medium text-sm">Edit {edit}</div><button onClick={()=>setEdit(null)} className="text-[#777]"><X size={15}/></button></div>{Object.keys(cfg).length>0?<><div className="grid grid-cols-2 gap-2">{Object.entries(cfg).map(([key,value])=><label key={key} className="text-[11px] text-[#777] capitalize">{key}<input type="number" min={1} step={key==="mult"?0.1:1} value={value} onChange={e=>setCfg(x=>({...x,[key]:Number(e.target.value)}))} className="mt-1 w-full rounded border border-[#333] bg-black px-2 py-2 text-sm text-white outline-none focus:border-white"/></label>)}</div><button onClick={save} className="w-full mt-3 rounded-md bg-white text-black py-2 text-sm font-medium">Apply Changes</button></>:<div className="text-xs text-[#777] mb-3">This indicator has no numeric parameters.</div>}</div>}
  </div>}
 </div>;
}
