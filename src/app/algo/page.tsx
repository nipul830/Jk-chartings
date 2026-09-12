"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Play, Pause, RotateCcw } from "lucide-react";

type Condition = { id: number; indicator: "RSI" | "EMA"; operator: ">" | "<" | "crosses above" | "crosses below"; value: string };
const initialConditions: Condition[] = [
  { id: 1, indicator: "RSI", operator: "<", value: "30" },
  { id: 2, indicator: "EMA", operator: "crosses above", value: "EMA 20" },
];

export default function AlgoPage() {
  const [name, setName] = useState("My Strategy");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [capital, setCapital] = useState("1000");
  const [indicators, setIndicators] = useState<{id:string;name:string}[]>([]);
  const [running, setRunning] = useState(false);
  const [paperTrading, setPaperTrading] = useState(true);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    const loadIndicators = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("jk-indicators") || "[]");
        setIndicators(Array.isArray(raw) ? raw.filter((x) => x && typeof x.name === "string") : []);
      } catch { setIndicators([]); }
    };
    loadIndicators();
    window.addEventListener("jk-indicators-changed", loadIndicators);
    const saved = localStorage.getItem("jk-algo-settings");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (typeof data.name === "string") setName(data.name);
      if (typeof data.symbol === "string") setSymbol(data.symbol);
      if (typeof data.timeframe === "string") setTimeframe(data.timeframe);
      if (typeof data.capital === "string") setCapital(data.capital);
      if (Array.isArray(data.conditions)) setConditions(data.conditions);
      if (typeof data.running === "boolean") setRunning(data.running);
      if (typeof data.paperTrading === "boolean") setPaperTrading(data.paperTrading);
    } catch {}
  }, []);

  useEffect(() => {
    return () => window.removeEventListener("jk-indicators-changed", () => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("jk-algo-settings", JSON.stringify({ name, symbol, timeframe, capital, conditions, running, paperTrading }));
  }, [name, symbol, timeframe, capital, running, paperTrading]);

  useEffect(() => {
    const account = localStorage.getItem("jk-paper-account");
    if (!account) {
      localStorage.setItem("jk-paper-account", JSON.stringify({ balance: Number(capital) || 0, orders: [], positions: [] }));
    }
  }, []);

  const reset = () => {
    setName("My Strategy"); setSymbol("BTCUSDT"); setTimeframe("15m"); setCapital("1000");
    setRunning(false); setPaperTrading(true); setTested(false);
    localStorage.removeItem("jk-algo-settings");
  };
  const resetPaperAccount = () => {
    localStorage.setItem("jk-paper-account", JSON.stringify({ balance: Number(capital) || 0, orders: [], positions: [] }));
  };

  return (
    <main className="min-h-[calc(100vh-56px)] bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><BrainCircuit size={22}/><div><h1 className="text-xl font-semibold">{name}</h1><p className="text-sm text-[#777]">Strategy builder</p></div></div>
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="flex items-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-sm text-[#aaa]"><RotateCcw size={15}/>Reset</button>
            <button type="button" onClick={() => setRunning((v) => !v)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">{running ? <Pause size={15}/> : <Play size={15}/>} {running ? "Pause Algo" : "Run Algo"}</button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl border border-[#222] bg-[#080808] p-5">
            <h2 className="mb-4 font-semibold">Strategy</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm text-[#aaa]">Name<input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2 text-white"/></label>
              <label className="text-sm text-[#aaa]">Symbol<input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2 text-white"/></label>
              <label className="text-sm text-[#aaa]">Timeframe<select value={timeframe} onChange={(e)=>setTimeframe(e.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2 text-white">{["1m","5m","15m","1h","4h","1d"].map((v)=><option key={v}>{v}</option>)}</select></label>
            </div>
            <label className="mt-3 block text-sm text-[#aaa]">Starting capital<input type="number" min="0" value={capital} onChange={(e)=>setCapital(e.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2 text-white sm:max-w-xs"/></label>
            <div className="mt-6"><h2 className="mb-3 font-semibold">Indicators from Settings</h2><div className="flex flex-wrap gap-2">{indicators.length ? indicators.map((item)=><span key={item.id} className="rounded-lg border border-[#333] px-3 py-1.5 text-sm text-[#aaa]">{item.name}</span>) : <span className="text-sm text-[#666]">No indicators selected in Settings.</span>}</div><p className="mt-2 text-xs text-[#666]">Manage indicators from Settings. Changes sync automatically to Algo.</p></div>

            <div className="mt-6"><h2 className="mb-3 font-semibold">Exit rules</h2><div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-[#aaa]">Take profit %<input type="number" defaultValue="2" className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2"/></label>
              <label className="text-sm text-[#aaa]">Stop loss %<input type="number" defaultValue="1" className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2"/></label>
            </div></div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-[#222] bg-[#080808] p-5">
              <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Paper Trading</h2><button type="button" onClick={()=>setPaperTrading((v)=>!v)} className={paperTrading ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-black" : "rounded-full border border-[#444] px-3 py-1 text-xs text-[#888]"}>{paperTrading ? "ON" : "OFF"}</button></div>
              <p className="text-sm text-[#777]">Algo execution is routed to the local paper account. No real exchange orders are sent.</p>
              <button type="button" onClick={resetPaperAccount} className="mt-3 w-full rounded-lg border border-[#333] py-2 text-sm text-[#aaa] hover:text-white">Reset paper account</button>
            </section>

            <section className="rounded-xl border border-[#222] bg-[#080808] p-5">
              <h2 className="mb-4 font-semibold">Backtest</h2>
              <button type="button" onClick={()=>setTested(true)} className="w-full rounded-lg bg-white py-2.5 font-semibold text-black">Run backtest</button>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Win rate</p><p className="mt-1 text-xl">{tested ? "72%" : "--"}</p></div>
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Return</p><p className="mt-1 text-xl">{tested ? "+12.4%" : "--"}</p></div>
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Trades</p><p className="mt-1 text-xl">{tested ? "42" : "--"}</p></div>
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Capital</p><p className="mt-1 text-xl">{`$${capital || "0"}`}</p></div>
              </div>
              <p className="mt-3 text-xs text-[#666]">Demo metrics only.</p>
            </section>

            <section className="rounded-xl border border-[#222] bg-[#080808] p-5"><h2 className="mb-3 font-semibold">Algo status</h2><div className="flex items-center justify-between rounded-lg border border-[#222] px-3 py-3"><span className="text-sm text-[#aaa]">{symbol} · {timeframe}</span><span className={running ? "text-sm text-green-400" : "text-sm text-[#777]"}>{running ? "Running" : "Stopped"}</span></div><p className="mt-3 text-xs text-[#666]">{paperTrading ? "Paper trading enabled." : "Paper trading disabled."}</p></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
