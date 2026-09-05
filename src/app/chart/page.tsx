"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useChartStore } from "@/lib/store/useChartStore";
import { ChartPane } from "@/components/chart/ChartPane";
import { LayoutSelector } from "@/components/chart/LayoutSelector";
import { TimeframeSelector } from "@/components/chart/TimeframeSelector";

function ChartContent() {
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol");
  const { layout, charts, setLayout, setChartSymbol, updateChart } = useChartStore();

  useEffect(() => {
    if (symbolFromUrl && charts[0]) {
      setChartSymbol(charts[0].id, symbolFromUrl);
    }
  }, [symbolFromUrl]);

  const gridClass =
    layout === 1
      ? "grid-cols-1"
      : layout === 2
      ? "grid-cols-1 md:grid-cols-2"
      : layout === 4
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const height = layout === 1 ? 600 : layout === 2 ? 450 : 320;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#222] bg-[#0a0a0a] overflow-x-auto">
        <LayoutSelector value={layout} onChange={setLayout} />
        <div className="w-px h-5 bg-[#333]" />
        <TimeframeSelector
          value={charts[0]?.timeframe || "15m"}
          onChange={(tf) => {
            charts.forEach((c) => updateChart(c.id, { timeframe: tf }));
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className={`flex-1 grid ${gridClass} gap-1 p-1 overflow-auto`}>
        {charts.map((chart) => (
          <div key={chart.id} className="min-h-[280px]">
            <ChartPane
              symbol={chart.symbol}
              timeframe={chart.timeframe}
              height={height}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChartPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-56px)] flex items-center justify-center text-[#666]">
        Loading charts...
      </div>
    }>
      <ChartContent />
    </Suspense>
  );
}
