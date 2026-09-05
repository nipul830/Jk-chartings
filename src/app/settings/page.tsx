"use client";

import { useEffect, useState } from "react";

const defaultUp = "#ffffff";
const defaultDown = "#666666";

export default function SettingsPage() {
  const [upColor, setUpColor] = useState(defaultUp);
  const [downColor, setDownColor] = useState(defaultDown);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jk-candle-colors");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.up) setUpColor(parsed.up);
        if (parsed?.down) setDownColor(parsed.down);
      }
    } catch {}
  }, []);

  const saveColors = (up: string, down: string) => {
    setUpColor(up);
    setDownColor(down);
    try {
      localStorage.setItem("jk-candle-colors", JSON.stringify({ up, down }));
      window.dispatchEvent(new Event("jk-candle-colors-changed"));
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      <div className="space-y-6">
        <section className="border border-[#222] rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3 text-[#aaa]">Theme</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border-2 border-white rounded" />
            <div>
              <p className="font-medium">Black & White</p>
              <p className="text-xs text-[#666]">Monochrome theme</p>
            </div>
          </div>
        </section>

        <section className="border border-[#222] rounded-lg p-4">
          <h2 className="text-sm font-medium mb-4 text-[#aaa]">Candle Colors</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Up candle</span>
              <input type="color" value={upColor} onChange={(e) => saveColors(e.target.value, downColor)} className="w-14 h-9 cursor-pointer bg-transparent" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Down candle</span>
              <input type="color" value={downColor} onChange={(e) => saveColors(upColor, e.target.value)} className="w-14 h-9 cursor-pointer bg-transparent" />
            </div>
            <div className="text-xs text-[#666]">Changes apply to all charts instantly and are saved on this device.</div>
            <div className="text-xs text-[#666]">Quick presets</div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => saveColors("#00c853", "#ff1744")} className="px-3 py-2 rounded border border-[#333] text-sm">Green/Red</button>
              <button type="button" onClick={() => saveColors("#ffffff", "#666666")} className="px-3 py-2 rounded border border-[#333] text-sm">White/Grey</button>
              <button type="button" onClick={() => saveColors("#2196f3", "#ff9800")} className="px-3 py-2 rounded border border-[#333] text-sm">Blue/Orange</button>
            </div>
          </div>
        </section>

        <section className="border border-[#222] rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3 text-[#aaa]">Default Timeframe</h2>
          <select className="bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm w-full max-w-xs">
            <option>15m</option><option>1H</option><option>4H</option><option>1D</option>
          </select>
        </section>

        <section className="border border-[#222] rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3 text-[#aaa]">About</h2>
          <p className="text-sm text-[#888]">Jk-Chartings – Clean multi-layout trading charts.<br />Data from Binance public API (free).<br />Drawing tools & custom indicators coming soon.</p>
        </section>
      </div>
    </div>
  );
}
