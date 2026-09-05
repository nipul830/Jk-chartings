"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useChartStore } from "@/lib/store/useChartStore";
import { ChartPane } from "@/components/chart/ChartPane";
import { LayoutSelector } from "@/components/chart/LayoutSelector";
import { TimeframeSelector } from "@/components/chart/TimeframeSelector";

const SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "LTCUSDT",
  "TRXUSDT",
  "DOTUSDT",
];

function ChartContent() {
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol");
  const { layout, charts, setLayout, setChartSymbol, updateChart } = useChartStore();
  const [symbolPicker, setSymbolPicker] = useState<string | null>(null);

  useEffect(() => {
    if (symbolFromUrl && charts[0]) setChartSymbol(charts[0].id, symbolFromUrl);
  }, [symbolFromUrl]);

  const gridClass =
    layout === 1 ? "grid-cols-1" : layout === 2 ? "grid-cols-1 md:grid-cols-2" : layout === 4 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  const height = layout === 1 ? 600 : layout === 2 ? 450 : 320;

  const chooseSymbol = (symbol: string) => {
    if (!symbolPicker) return;
    setChartSymbol(symbolPicker, symbol);
    setSymbolPicker(null);
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#222] bg-[#0a0a0a] overflow-x-auto">
        <LayoutSelector value={layout} onChange={setLayout} />
        <div className="w-px h-5 bg-[#333]" />
        <TimeframeSelector value={charts[0]?.timeframe || "15m"} onChange={(tf) => charts.forEach((c) => updateChart(c.id, { timeframe: tf }))} />
      </div>

      <div className={`flex-1 grid ${gridClass} gap-1 p-1 overflow-auto`}>
        {charts.map((chart) => (
          <div key={chart.id} className="min-h-[280px]">
            <ChartPane
              key={`${chart.id}-${chart.symbol}-${chart.timeframe}`}
              symbol={chart.symbol}
              timeframe={chart.timeframe}
              height={height}
              onSymbolClick={() => setSymbolPicker(chart.id)}
            />
          </div>
        ))}
      </div>

      {symbolPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setSymbolPicker(null)}>
          <div className="w-full max-w-sm rounded-lg border border-[#333] bg-[#0a0a0a] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold mb-1">Select symbol</div>
            <div className="text-xs text-[#888] mb-4">Tap a symbol to change this chart</div>
            <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto">
              {SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => chooseSymbol(symbol)}
                  className="rounded border border-[#333] bg-black px-3 py-3 text-sm text-white text-left hover:border-white active:bg-white active:text-black transition-colors"
                >
                  {symbol}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSymbolPicker(null)} className="w-full mt-3 rounded border border-[#333] px-3 py-2 text-sm text-[#aaa]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChartPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-56px)] flex items-center justify-center text-[#666]">Loading charts...</div>}>
      <ChartContent />
    </Suspense>
  );
}
