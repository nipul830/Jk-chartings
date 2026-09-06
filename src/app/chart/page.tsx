"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Maximize2, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { useChartStore } from "@/lib/store/useChartStore";
import { ChartPane } from "@/components/chart/ChartPane";
import { LayoutSelector } from "@/components/chart/LayoutSelector";
import { PineEditor } from "@/components/chart/PineEditor";

const SYMBOLS=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","DOGEUSDT","ADAUSDT","AVAXUSDT","LINKUSDT","LTCUSDT","TRXUSDT","DOTUSDT"];
function ChartContent(){
 const searchParams=useSearchParams();const symbolFromUrl=searchParams.get("symbol");const{layout,charts,setLayout,setChartSymbol,updateChart}=useChartStore();const[symbolPicker,setSymbolPicker]=useState<string|null>(null);const[active,setActive]=useState(0);
 useEffect(()=>{if(symbolFromUrl&&charts[0])setChartSymbol(charts[0].id,symbolFromUrl)},[symbolFromUrl]);
 const activeChart=charts[active]||charts[0];
 const gridClass=layout===1?"grid-cols-1 grid-rows-1":layout===2?"grid-cols-1 md:grid-cols-2 grid-rows-1":layout===4?"grid-cols-1 md:grid-cols-2 grid-rows-2":"grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2";
 const chartHeight=layout===1?600:layout===2?560:280;
 return <div className="h-[calc(100vh-56px)] min-h-0 flex flex-col bg-black overflow-hidden">
  <div className="border-b border-[#222] bg-[#080808] shrink-0"><div className="flex items-center gap-2 px-2 py-2 overflow-x-auto whitespace-nowrap">
   <button type="button" onClick={()=>activeChart&&setSymbolPicker(activeChart.id)} className="h-9 px-3 rounded-md border border-[#333] bg-[#0d0d0d] text-sm font-medium text-white hover:border-white">{activeChart?.symbol||"BTCUSDT"} ▾</button>
   <div className="h-6 w-px bg-[#333]"/><LayoutSelector value={layout} onChange={setLayout}/>
   <button type="button" title="Chart settings" className="h-9 w-9 rounded-md border border-[#333] text-[#aaa] flex items-center justify-center hover:text-white hover:border-white"><SlidersHorizontal size={16}/></button>
   <PineEditor />
   <button type="button" title="Fullscreen" onClick={()=>document.documentElement.requestFullscreen?.().catch(()=>{})} className="h-9 w-9 rounded-md border border-[#333] text-[#aaa] flex items-center justify-center hover:text-white hover:border-white"><Maximize2 size={16}/></button>
   <button type="button" title="More" className="h-9 w-9 rounded-md border border-[#333] text-[#aaa] flex items-center justify-center hover:text-white hover:border-white"><MoreHorizontal size={17}/></button>
  </div></div>
  <div className={`flex-1 min-h-0 grid ${gridClass} gap-px p-px overflow-hidden bg-[#222]`}>{charts.map((chart,i)=><div key={chart.id} onClick={()=>setActive(i)} className={`relative min-h-0 min-w-0 overflow-hidden bg-black [&>div]:!overflow-hidden ${active===i?"ring-1 ring-inset ring-[#555]":""}`}><ChartPane key={`${chart.id}-${chart.symbol}-${chart.timeframe}`} chartId={chart.id} symbol={chart.symbol} timeframe={chart.timeframe} height={chartHeight} onSymbolClick={()=>setSymbolPicker(chart.id)} onTimeframeChange={tf=>updateChart(chart.id,{timeframe:tf})}/></div>)}</div>
  <div className="h-7 shrink-0 border-t border-[#222] bg-[#080808] px-3 flex items-center justify-between text-[10px] text-[#777]"><span>JK Chartings • Live Binance data</span><span>{activeChart?.symbol||"BTCUSDT"} · {activeChart?.timeframe||"15m"}</span></div>
  {symbolPicker&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={()=>setSymbolPicker(null)}><div className="w-full max-w-sm rounded-xl border border-[#333] bg-[#0a0a0a] p-4 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="text-lg font-semibold mb-1">Select symbol</div><div className="text-xs text-[#888] mb-4">Choose the market for this chart</div><div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto">{SYMBOLS.map(symbol=><button key={symbol} type="button" onClick={()=>{if(symbolPicker)setChartSymbol(symbolPicker,symbol);setSymbolPicker(null)}} className="rounded border border-[#333] bg-black px-3 py-3 text-sm text-white text-left hover:border-white active:bg-white active:text-black transition-colors">{symbol}</button>)}</div><button type="button" onClick={()=>setSymbolPicker(null)} className="w-full mt-3 rounded border border-[#333] px-3 py-2 text-sm text-[#aaa]">Cancel</button></div></div>}
 </div>
}
export default function ChartPage(){return <Suspense fallback={<div className="h-[calc(100vh-56px)] flex items-center justify-center text-[#666]">Loading charts...</div>}><ChartContent/></Suspense>}
