"use client";
import {useEffect,useState} from "react";
import {Settings2,X} from "lucide-react";

type IndicatorItem={id:string;name:string};
type Config=Record<string,number|string>;

const defaults:Record<string,Config>={
 "Moving Average":{length:20,color:"#00bcd4",width:2},EMA:{length:20,color:"#ff9800",width:2},SMA:{length:20,color:"#00bcd4",width:2},"Bollinger Bands":{length:20,mult:2,color:"#ffffff",width:2},VWAP:{color:"#e91e63",width:2},RSI:{length:14,color:"#00e676",width:2},MACD:{fast:12,slow:26,signal:9,color:"#29b6f6",width:2},Stochastic:{length:14,smooth:3,color:"#42a5f5",width:2},ATR:{length:14,color:"#ff9800",width:2},ADX:{length:14,color:"#ab47bc",width:2},CCI:{length:20,color:"#26c6da",width:2},"Williams %R":{length:14,color:"#66bb6a",width:2},Volume:{color:"#777777",width:2},"Volume Profile":{color:"#9c27b0",width:2}
};

const normalize=(raw:any[]):IndicatorItem[]=>raw.map((v:any,i:number)=>typeof v==="string"?{id:`${v}-${i+1}`,name:v}:v&&v.id&&v.name?{id:String(v.id),name:String(v.name)}:null).filter(Boolean) as IndicatorItem[];

export function IndicatorMenu(){
 const[selected,setSelected]=useState<IndicatorItem[]>([]);
 const[edit,setEdit]=useState<IndicatorItem|null>(null);
 const[cfg,setCfg]=useState<Config>({});

 useEffect(()=>{
  const read=()=>{try{const a=JSON.parse(localStorage.getItem("jk-indicators")||"[]");setSelected(Array.isArray(a)?normalize(a):[])}catch{setSelected([])}};
  read();
  window.addEventListener("jk-indicators-changed",read);
  return()=>window.removeEventListener("jk-indicators-changed",read);
 },[]);

 const startEdit=(item:IndicatorItem)=>{
  let all:any={};
  try{all=JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}")}catch{}
  const saved=all[item.id]||all[item.name]||{};
  setCfg({...defaults[item.name],...saved});
  setEdit(item);
 };

 const save=()=>{
  if(!edit)return;
  let all:any={};
  try{all=JSON.parse(localStorage.getItem("jk-indicator-settings")||"{}")}catch{}
  all[edit.id]=cfg;
  localStorage.setItem("jk-indicator-settings",JSON.stringify(all));
  window.dispatchEvent(new Event("jk-indicators-changed"));
  setEdit(null);
 };

 return <div className="relative flex items-center gap-1">
  {selected.length===0&&<span className="text-xs text-[#777] px-2">Indicators</span>}
  {selected.map((item,i)=><div key={item.id} className="flex items-center gap-1 rounded-md border border-[#333] bg-[#0a0a0a] px-2 h-9 text-xs text-white">
   <span>{item.name}{selected.filter(x=>x.name===item.name).length>1?` #${selected.slice(0,i+1).filter(x=>x.name===item.name).length}`:""}</span>
   <button type="button" title={`Edit ${item.name}`} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();startEdit(item)}} className="w-6 h-6 flex items-center justify-center rounded text-[#888] hover:text-white hover:bg-[#222]"><Settings2 size={14}/></button>
  </div>)}

  {edit&&<div className="absolute left-0 top-11 z-[300] w-[min(360px,calc(100vw-24px))] rounded-xl border border-[#333] bg-[#080808] shadow-2xl overflow-hidden">
   <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]"><div><div className="font-medium text-sm text-white">{edit.name}{selected.filter(x=>x.name===edit.name).length>1?` #${selected.findIndex(x=>x.id===edit.id)+1}`:""} Settings</div><div className="text-[11px] text-[#666]">Color and line thickness for this indicator</div></div><button type="button" onClick={()=>setEdit(null)} className="text-[#777] hover:text-white"><X size={15}/></button></div>
   <div className="p-4">
    <div className="grid grid-cols-2 gap-2">{Object.entries(cfg).filter(([key])=>key!=="color"&&key!=="width").map(([key,value])=><label key={key} className="text-[11px] text-[#777] capitalize">{key}<input type="number" min={1} step={key==="mult"?0.1:1} value={Number(value)} onChange={e=>setCfg(x=>({...x,[key]:Number(e.target.value)}))} className="mt-1 w-full rounded border border-[#333] bg-black px-2 py-2 text-sm text-white outline-none focus:border-white"/></label>)}</div>
    <label className="block mt-3 text-[11px] text-[#777]">Color<input type="color" value={String(cfg.color||"#ffffff")} onChange={e=>setCfg(x=>({...x,color:e.target.value}))} className="mt-1 w-full h-10 rounded border border-[#333] bg-black cursor-pointer"/></label>
    <label className="block mt-3 text-[11px] text-[#777]">Line Thickness <span className="text-white">{Number(cfg.width)||2}px</span><input type="range" min={1} max={5} step={1} value={Number(cfg.width)||2} onChange={e=>setCfg(x=>({...x,width:Number(e.target.value)}))} className="mt-2 w-full"/></label>
    <button type="button" onClick={save} className="w-full mt-3 rounded-md bg-white text-black py-2 text-sm font-medium">Apply Changes</button>
   </div>
  </div>}
 </div>;
}
