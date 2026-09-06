"use client";
import {useEffect,useState} from "react";
import {Settings2,X} from "lucide-react";

const defaults:Record<string,Record<string,number>>={"Moving Average":{length:20},EMA:{length:20},SMA:{length:20},"Bollinger Bands":{length:20,mult:2},VWAP:{},RSI:{length:14},MACD:{fast:12,slow:26,signal:9},Stochastic:{length:14,smooth:3},ATR:{length:14},ADX:{length:14},CCI:{length:20},"Williams %R":{length:14},Volume:{},"Volume Profile":{}};

export function IndicatorMenu(){
 const[selected,setSelected]=useState<string[]>([]),[edit,setEdit]=useState<string|null>(null),[cfg,setCfg]=useState<Record<string,number>>({});
 useEffect(()=>{const read=()=>{try{const a=JSON.parse(localStorage.getItem("jk-indicators")||"[]");setSelected(Array.isArray(a)?a:[])}catch{setSelected([])}};read();window.addEventListener("jk-indicators-changed",read);return()=>window.removeEventListener("jk-indicators-changed",read)},[]);
 const startEdit=(name:string)=>{let saved:any={};try{const all=JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}");saved=all[name]||{}}catch{}setCfg({...defaults[name],...saved});setEdit(name)};
 const save=()=>{if(!edit)return;let all:any={};try{all=JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}")}catch{}all[edit]=cfg;localStorage.setItem("jk-indicator-settings",JSON.stringify(all));window.dispatchEvent(new Event("jk-indicators-changed"));setEdit(null)};
 return <div className="relative flex items-center gap-1">
  {selected.length===0?<span className="text-[11px] text-[#666] px-2">No indicators</span>:selected.map(name=><div key={name} className="flex items-center gap-1 rounded-md bg-black/80 border border-[#333] px-2 py-1"><span className="text-xs text-white whitespace-nowrap">{name}</span><button type="button" title={`Edit ${name}`} onClick={()=>startEdit(name)} className="w-6 h-6 flex items-center justify-center rounded text-[#999] hover:text-white hover:bg-[#222]"><Settings2 size={13}/></button></div>)}
  {edit&&<div className="absolute left-0 top-10 z-[250] w-[min(320px,calc(100vw-24px))] rounded-xl border border-[#333] bg-[#080808] shadow-2xl overflow-hidden" onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
   <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]"><div><div className="font-medium text-sm">{edit} Settings</div><div className="text-[11px] text-[#666]">Change indicator values</div></div><button type="button" onClick={()=>setEdit(null)} className="text-[#777] hover:text-white"><X size={16}/></button></div>
   <div className="p-4">{Object.keys(cfg).length>0?<><div className="grid grid-cols-2 gap-2">{Object.entries(cfg).map(([key,value])=><label key={key} className="text-[11px] text-[#777] capitalize">{key}<input type="number" min={1} step={key==="mult"?0.1:1} value={value} onChange={e=>setCfg(x=>({...x,[key]:Number(e.target.value)}))} className="mt-1 w-full rounded border border-[#333] bg-black px-2 py-2 text-sm text-white outline-none focus:border-white"/></label>)}</div><button type="button" onClick={save} className="w-full mt-3 rounded-md bg-white text-black py-2 text-sm font-medium">Apply Changes</button></>:<div className="text-xs text-[#777]">No numeric settings for this indicator.</div>}</div>
  </div>}
 </div>;
}