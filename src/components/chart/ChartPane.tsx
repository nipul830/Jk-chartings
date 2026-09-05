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
const FIB_EVENT = "jk-fib-settings-changed";
const DEFAULT_FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

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

function getFibLevels(): number[] {
  if (typeof window === "undefined") return DEFAULT_FIB_LEVELS;
  try {
    const saved = localStorage.getItem("jk-fib-levels");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(Number).filter(Number.isFinite);
    }
  } catch {}
  return DEFAULT_FIB_LEVELS;
}

const TOOLS = ["Crosshair", "Trend line", "Horizontal line", "Vertical line", "Ray", "Rectangle", "Fibonacci Retracement"];

export function ChartPane({ symbol, timeframe, height = 400, onSymbolClick }: ChartPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const colorsRef = useRef(getCandleColors());
  const [showTools, setShowTools] = useState(false);
  const [selectedTool, setSelectedTool] = useState("Crosshair");
  const [showFibSettings, setShowFibSettings] = useState(false);
  const [fibLevels, setFibLevels] = useState<number[]>(getFibLevels());
  const [fibPoints, setFibPoints] = useState<{ x: number; y: number }[]>([]);

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
    const handleFibChange = () => setFibLevels(getFibLevels());
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener(COLOR_EVENT, handleColorChange);
    window.addEventListener(FIB_EVENT, handleFibChange);
    const handleResize = () => { if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth }); };
    window.addEventListener("resize", handleResize);
    return () => { observer.disconnect(); window.removeEventListener(COLOR_EVENT, handleColorChange); window.removeEventListener(FIB_EVENT, handleFibChange); window.removeEventListener("resize", handleResize); chart.remove(); };
  }, [height]);

  useEffect(() => {
    const loadData = async () => {
      if (!seriesRef.current) return;
      try {
        const interval = intervalMap[timeframe] || "15m";
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`);
        const raw = await res.json();
        if (!Array.isArray(raw)) throw new Error("Invalid Binance response");
        const data: CandlestickData[] = raw.map((k: any) => ({ time: Math.floor(k[0] / 1000) as any, open: parseFloat(k[1]), high: parseFloat(k[2]), low: parseFloat(k[3]), close: parseFloat(k[4]) }));
        seriesRef.current.setData(data); chartRef.current?.timeScale().fitContent();
      } catch (e) { console.error("Failed to load klines", e); }
    };
    loadData();
  }, [symbol, timeframe]);

  const saveFibLevels = (levels: number[]) => {
    const clean = levels.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    setFibLevels(clean);
    try {
      localStorage.setItem("jk-fib-levels", JSON.stringify(clean));
      window.dispatchEvent(new Event(FIB_EVENT));
    } catch {}
  };

  const handleFibPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedTool !== "Fibonacci Retracement" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setFibPoints((prev) => prev.length >= 2 ? [point] : [...prev, point]);
  };

  const fib = fibPoints.length === 2 ? { x1: fibPoints[0].x, y1: fibPoints[0].y, x2: fibPoints[1].x, y2: fibPoints[1].y } : null;
  const fibPrices = fib ? fibLevels.map((level) => ({ level, y: fib.y1 + (fib.y2 - fib.y1) * level })) : [];

  return (
    <div className="w-full h-full relative border border-[#1a1a1a] bg-black light:bg-white">
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
        <button type="button" onClick={(e) => { e.stopPropagation(); onSymbolClick?.(); }} className="text-xs bg-black/70 px-2 py-1 rounded border border-[#333] hover:border-white transition-colors" title="Change symbol">{symbol} · {timeframe}</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setShowTools((v) => !v); }} className={`w-7 h-7 flex items-center justify-center rounded border transition-colors ${showTools ? "bg-white text-black border-white" : "bg-black/70 text-[#aaa] border-[#333] hover:text-white hover:border-white"}`} title="Chart tools" aria-label="Chart tools">
          <Wrench size={14} />
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full" />

      {selectedTool === "Fibonacci Retracement" && (
        <div className="absolute inset-0 z-10 cursor-crosshair" onPointerDown={handleFibPointerDown}>
          {fib && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <line x1={fib.x1} y1={fib.y1} x2={fib.x2} y2={fib.y2} stroke="currentColor" strokeWidth="1" opacity="0.7" />
              {fibPrices.map(({ level, y }) => (
                <g key={level}>
                  <line x1="0" y1={y} x2="100%" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.65" />
                  <text x="8" y={y - 3} fill="currentColor" fontSize="11">{(level * 100).toFixed(level % 1 === 0 ? 0 : 1)}%</text>
                </g>
              ))}
            </svg>
          )}
          {fibPoints.length === 1 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 rounded bg-black/80 px-3 py-2 text-xs text-white border border-[#333]">Tap second point to place Fibonacci</div>}
        </div>
      )}

      {showTools && (
        <div className="absolute top-11 left-2 z-30 w-52 rounded-lg border border-[#333] bg-[#0a0a0a] p-2 shadow-2xl">
          <div className="px-2 py-1 text-xs font-semibold text-[#888]">Tools</div>
          <div className="flex flex-col gap-1">
            {TOOLS.map((tool) => (
              <button key={tool} type="button" onClick={() => { setSelectedTool(tool); setShowTools(false); if (tool !== "Fibonacci Retracement") setFibPoints([]); }} className={`w-full rounded px-2 py-2 text-left text-sm transition-colors ${selectedTool === tool ? "bg-white text-black" : "text-white hover:bg-[#1a1a1a]"}`}>
                {tool}
              </button>
            ))}
            <button type="button" onClick={() => { setShowFibSettings(true); setShowTools(false); }} className="w-full rounded px-2 py-2 text-left text-sm text-[#aaa] hover:bg-[#1a1a1a] hover:text-white">Fibonacci Settings</button>
          </div>
        </div>
      )}

      {showFibSettings && (
        <div className="absolute top-11 left-2 z-40 w-64 rounded-lg border border-[#333] bg-[#0a0a0a] p-3 shadow-2xl">
          <div className="text-sm font-semibold text-white mb-1">Fibonacci Settings</div>
          <div className="text-[11px] text-[#888] mb-3">Set the levels shown on each Fibonacci tool.</div>
          <div className="max-h-52 overflow-y-auto space-y-2">
            {fibLevels.map((level, index) => (
              <div key={`${index}-${level}`} className="flex items-center gap-2">
                <span className="text-xs text-[#aaa] w-8">{index + 1}</span>
                <input type="number" step="0.001" value={level} onChange={(e) => { const next = [...fibLevels]; next[index] = Number(e.target.value); setFibLevels(next); }} className="w-full rounded border border-[#333] bg-black px-2 py-1.5 text-sm text-white" />
                <button type="button" onClick={() => setFibLevels(fibLevels.filter((_, i) => i !== index))} className="text-xs text-[#888] hover:text-white">×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setFibLevels([...fibLevels, 1.618])} className="flex-1 rounded border border-[#333] px-2 py-2 text-xs text-white">+ 1.618</button>
            <button type="button" onClick={() => saveFibLevels(fibLevels)} className="flex-1 rounded bg-white px-2 py-2 text-xs font-semibold text-black">Save</button>
          </div>
          <button type="button" onClick={() => { setFibLevels(DEFAULT_FIB_LEVELS); saveFibLevels(DEFAULT_FIB_LEVELS); }} className="w-full mt-2 rounded border border-[#333] px-2 py-2 text-xs text-[#aaa]">Reset defaults</button>
        </div>
      )}
    </div>
  );
}
