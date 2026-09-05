"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";

interface ChartPaneProps {
  symbol: string;
  timeframe: string;
  height?: number;
  onSymbolClick?: () => void;
}

const intervalMap: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
};

const defaultUp = "#ffffff";
const defaultDown = "#666666";

export function ChartPane({ symbol, timeframe, height = 400, onSymbolClick }: ChartPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const colorsRef = useRef({ up: defaultUp, down: defaultDown });
  const lastTapRef = useRef(0);
  const [showColors, setShowColors] = useState(false);
  const [upColor, setUpColor] = useState(defaultUp);
  const [downColor, setDownColor] = useState(defaultDown);

  const applyCandleColors = (up: string, down: string) => {
    colorsRef.current = { up, down };
    seriesRef.current?.applyOptions({
      upColor: up,
      downColor: down,
      borderUpColor: up,
      borderDownColor: down,
      wickUpColor: up,
      wickDownColor: down,
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`jk-candle-colors-${symbol}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.up && parsed?.down) {
          setUpColor(parsed.up);
          setDownColor(parsed.down);
          colorsRef.current = { up: parsed.up, down: parsed.down };
        }
      } else {
        setUpColor(defaultUp);
        setDownColor(defaultDown);
        colorsRef.current = { up: defaultUp, down: defaultDown };
      }
    } catch {}
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    const isLight = document.documentElement.classList.contains("light");
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: isLight ? "#ffffff" : "#000000" },
        textColor: isLight ? "#111111" : "#ffffff",
      },
      grid: {
        vertLines: { color: isLight ? "#e5e5e5" : "#1a1a1a" },
        horzLines: { color: isLight ? "#e5e5e5" : "#1a1a1a" },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: isLight ? "#d0d0d0" : "#222222" },
      timeScale: { borderColor: isLight ? "#d0d0d0" : "#222222", timeVisible: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: colorsRef.current.up,
      downColor: colorsRef.current.down,
      borderUpColor: colorsRef.current.up,
      borderDownColor: colorsRef.current.down,
      wickUpColor: colorsRef.current.up,
      wickDownColor: colorsRef.current.down,
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const updateTheme = () => {
      const light = document.documentElement.classList.contains("light");
      chart.applyOptions({
        layout: { background: { color: light ? "#ffffff" : "#000000" }, textColor: light ? "#111111" : "#ffffff" },
        grid: { vertLines: { color: light ? "#e5e5e5" : "#1a1a1a" }, horzLines: { color: light ? "#e5e5e5" : "#1a1a1a" } },
        rightPriceScale: { borderColor: light ? "#d0d0d0" : "#222222" },
        timeScale: { borderColor: light ? "#d0d0d0" : "#222222" },
      });
      applyCandleColors(colorsRef.current.up, colorsRef.current.down);
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    const loadData = async () => {
      if (!seriesRef.current) return;
      try {
        const interval = intervalMap[timeframe] || "15m";
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=300`);
        const raw = await res.json();
        const data: CandlestickData[] = raw.map((k: any) => ({
          time: Math.floor(k[0] / 1000) as any,
          open: parseFloat(k[1]), high: parseFloat(k[2]), low: parseFloat(k[3]), close: parseFloat(k[4]),
        }));
        seriesRef.current.setData(data);
        chartRef.current?.timeScale().fitContent();
      } catch (e) { console.error("Failed to load klines", e); }
    };
    loadData();
  }, [symbol, timeframe]);

  const saveColors = (up: string, down: string) => {
    setUpColor(up);
    setDownColor(down);
    applyCandleColors(up, down);
    try { localStorage.setItem(`jk-candle-colors-${symbol}`, JSON.stringify({ up, down })); } catch {}
  };

  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 450) {
      setShowColors(true);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <div
      className="w-full h-full relative border border-[#1a1a1a] bg-black light:bg-white"
      onDoubleClick={() => setShowColors(true)}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSymbolClick?.(); }}
        onTouchEnd={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 z-10 text-xs bg-black/70 px-2 py-1 rounded border border-[#333] hover:border-white transition-colors"
        title="Change symbol"
      >
        {symbol} · {timeframe}
      </button>

      <div ref={containerRef} className="w-full h-full" />

      {showColors && (
        <div
          className="absolute top-12 left-2 z-50 w-64 rounded-lg border border-[#333] bg-[#0a0a0a] p-3 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="text-sm font-semibold mb-3 text-white">Candle Colors</div>

          <div className="flex items-center justify-between mb-3 text-sm text-white">
            <span>Up candle</span>
            <input type="color" value={upColor} onChange={(e) => saveColors(e.target.value, downColor)} className="w-12 h-8 cursor-pointer bg-transparent" />
          </div>

          <div className="flex items-center justify-between mb-3 text-sm text-white">
            <span>Down candle</span>
            <input type="color" value={downColor} onChange={(e) => saveColors(upColor, e.target.value)} className="w-12 h-8 cursor-pointer bg-transparent" />
          </div>

          <div className="text-[11px] text-[#888] mb-2">Quick presets</div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => saveColors("#00c853", "#ff1744")} className="px-2 py-1 rounded border border-[#333] text-xs text-white">Green/Red</button>
            <button type="button" onClick={() => saveColors("#ffffff", "#666666")} className="px-2 py-1 rounded border border-[#333] text-xs text-white">White/Grey</button>
            <button type="button" onClick={() => saveColors("#2196f3", "#ff9800")} className="px-2 py-1 rounded border border-[#333] text-xs text-white">Blue/Orange</button>
          </div>

          <button type="button" onClick={() => setShowColors(false)} className="w-full mt-3 rounded bg-white px-3 py-2 text-sm font-semibold text-black">Done</button>
        </div>
      )}
    </div>
  );
}
