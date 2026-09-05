"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { Wrench } from "lucide-react";

interface ChartPaneProps {
  symbol: string;
  timeframe: string;
  height?: number;
  onSymbolClick?: () => void;
}

const intervalMap: Record<string, string> = { "1m": "1m", "5m": "5m", "15m": "15m", "1H": "1h", "4H": "4h", "1D": "1d" };
const defaultUp = "#ffffff";
const defaultDown = "#666666";
const COLOR_EVENT = "jk-candle-colors-changed";

function getCandleColors() {
  if (typeof window === "undefined") return { up: defaultUp, down: defaultDown };
  try {
    const saved = localStorage.getItem("jk-candle-colors");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.up && parsed?.down) return { up: parsed.up, down: parsed.down };
    }
  } catch {}
  return { up: defaultUp, down: defaultDown };
}

const TOOLS = ["Crosshair", "Trend line", "Horizontal line", "Vertical line", "Ray", "Rectangle"];

export function ChartPane({ symbol, timeframe, height = 400, onSymbolClick }: ChartPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const colorsRef = useRef(getCandleColors());
  const [showTools, setShowTools] = useState(false);
  const [selectedTool, setSelectedTool] = useState("Crosshair");

  const applyCandleColors = (up: string, down: string) => {
    colorsRef.current = { up, down };
    seriesRef.current?.applyOptions({ upColor: up, downColor: down, borderUpColor: up, borderDownColor: down, wickUpColor: up, wickDownColor: down });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    colorsRef.current = getCandleColors();
    const isLight = document.documentElement.classList.contains("light");
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth, height,
      layout: { background: { color: isLight ? "#ffffff" : "#000000" }, textColor: isLight ? "#111111" : "#ffffff" },
      grid: { vertLines: { color: isLight ? "#e5e5e5" : "#1a1a1a" }, horzLines: { color: isLight ? "#e5e5e5" : "#1a1a1a" } },
      crosshair: { mode: 0 }, rightPriceScale: { borderColor: isLight ? "#d0d0d0" : "#222222" }, timeScale: { borderColor: isLight ? "#d0d0d0" : "#222222", timeVisible: true },
    });
    const candleSeries = chart.addCandlestickSeries({ upColor: colorsRef.current.up, downColor: colorsRef.current.down, borderUpColor: colorsRef.current.up, borderDownColor: colorsRef.current.down, wickUpColor: colorsRef.current.up, wickDownColor: colorsRef.current.down });
    chartRef.current = chart; seriesRef.current = candleSeries;

    const updateTheme = () => {
      const light = document.documentElement.classList.contains("light");
      chart.applyOptions({ layout: { background: { color: light ? "#ffffff" : "#000000" }, textColor: light ? "#111111" : "#ffffff" }, grid: { vertLines: { color: light ? "#e5e5e5" : "#1a1a1a" }, horzLines: { color: light ? "#e5e5e5" : "#1a1a1a" } }, rightPriceScale: { borderColor: light ? "#d0d0d0" : "#222222" }, timeScale: { borderColor: light ? "#d0d0d0" : "#222222" } });
      applyCandleColors(colorsRef.current.up, colorsRef.current.down);
    };
    const handleColorChange = () => { const c = getCandleColors(); applyCandleColors(c.up, c.down); };
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener(COLOR_EVENT, handleColorChange);
    const handleResize = () => { if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth }); };
    window.addEventListener("resize", handleResize);
    return () => { observer.disconnect(); window.removeEventListener(COLOR_EVENT, handleColorChange); window.removeEventListener("resize", handleResize); chart.remove(); };
  }, [height]);

  useEffect(() => {
    const loadData = async () => {
      if (!seriesRef.current) return;
      try {
        const interval = intervalMap[timeframe] || "15m";
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`);
        const raw = await res.json();
        const data: CandlestickData[] = raw.map((k: any) => ({ time: Math.floor(k[0] / 1000) as any, open: parseFloat(k[1]), high: parseFloat(k[2]), low: parseFloat(k[3]), close: parseFloat(k[4]) }));
        seriesRef.current.setData(data); chartRef.current?.timeScale().fitContent();
      } catch (e) { console.error("Failed to load klines", e); }
    };
    loadData();
  }, [symbol, timeframe]);

  return (
    <div className="w-full h-full relative border border-[#1a1a1a] bg-black light:bg-white">
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
        <button type="button" onClick={(e) => { e.stopPropagation(); onSymbolClick?.(); }} className="text-xs bg-black/70 px-2 py-1 rounded border border-[#333] hover:border-white transition-colors" title="Change symbol">{symbol} · {timeframe}</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setShowTools((v) => !v); }} className={`w-7 h-7 flex items-center justify-center rounded border transition-colors ${showTools ? "bg-white text-black border-white" : "bg-black/70 text-[#aaa] border-[#333] hover:text-white hover:border-white"}`} title="Chart tools" aria-label="Chart tools">
          <Wrench size={14} />
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full" />

      {showTools && (
        <div className="absolute top-11 left-2 z-30 w-44 rounded-lg border border-[#333] bg-[#0a0a0a] p-2 shadow-2xl">
          <div className="px-2 py-1 text-xs font-semibold text-[#888]">Tools</div>
          <div className="flex flex-col gap-1">
            {TOOLS.map((tool) => (
              <button key={tool} type="button" onClick={() => { setSelectedTool(tool); setShowTools(false); }} className={`w-full rounded px-2 py-2 text-left text-sm transition-colors ${selectedTool === tool ? "bg-white text-black" : "text-white hover:bg-[#1a1a1a]"}`}>
                {tool}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
