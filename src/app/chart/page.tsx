"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useChartStore } from "@/lib/store/useChartStore";
import { ChartPane } from "@/components/chart/ChartPane";
import { LayoutSelector } from "@/components/chart/LayoutSelector";
import { TimeframeSelector } from "@/components/chart/TimeframeSelector";

function ChartContent() {
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol");
  const { layout, charts, setLayout, setChartSymbol, updateChart } = useChartStore();
  const [symbolPicker, setSymbolPicker] = useState<{ id: string; symbol: string } | null>(null);

  useEffect(() => {
    if (symbolFromUrl && charts[0]) setChartSymbol(charts[0].id, symbolFromUrl);
  }, [symbolFromUrl]);

  const gridClass =
    layout === 1 ? "grid-cols-1" : layout === 2 ? "grid-cols-1 md:grid-cols-2" : layout === 4 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  const height = layout === 1 ? 600 : layout === 2 ? 450 : 320;

  const chooseSymbol = () => {
    if (!symbolPicker) return;
    const value = symbolPicker.symbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!value) return;
    setChartSymbol(symbolPicker.id, value);
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
            <ChartPane symbol={chart.symbol} timeframe={chart.timeframe} height={height} onSymbolClick={() => setSymbolPicker({ id: chart.id, symbol: chart.symbol })} />
          </div>
        ))}
      </div>

      {symbolPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setSymbolPicker(null)}>
          <div className="w-full max-w-sm rounded-lg border border-[#333] bg-[#0a0a0a] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Change symbol</div>
            <input
              autoFocus
              value={symbolPicker.symbol}
              onChange={(e) => setSymbolPicker({ ...symbolPicker, symbol: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") chooseSymbol(); }}
              placeholder="e.g. BTCUSDT"
              className="w-full rounded border border-[#333] bg-black px-3 py-2 text-white outline-none focus:border-white"
            />
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={chooseSymbol} className="flex-1 rounded bg-white px-3 py-2 text-sm font-semibold text-black">Apply</button>
              <button type="button" onClick={() => setSymbolPicker(null)} className="rounded border border-[#333] px-3 py-2 text-sm text-[#aaa]">Cancel</button>
            </div>
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
