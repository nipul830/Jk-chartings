"use client";

import { useState } from "react";
import { BrainCircuit, Play, Pause, RotateCcw, Plus, Trash2 } from "lucide-react";

type Condition = {
  id: number;
  indicator: "RSI" | "EMA";
  operator: ">" | "<" | "crosses above" | "crosses below";
  value: string;
};

const initialConditions: Condition[] = [
  { id: 1, indicator: "RSI", operator: "<", value: "30" },
  { id: 2, indicator: "EMA", operator: "crosses above", value: "EMA 20" },
];

export default function AlgoPage() {
  const [name, setName] = useState("My Strategy");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [capital, setCapital] = useState("1000");
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);
  const [running, setRunning] = useState(false);
  const [tested, setTested] = useState(false);

  const addCondition = () => setConditions((items) => [...items, { id: Date.now(), indicator: "RSI", operator: ">", value: "50" }]);
  const updateCondition = (id: number, patch: Partial<Condition>) => setConditions((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const removeCondition = (id: number) => setConditions((items) => items.filter((item) => item.id !== id));
  const reset = () => {
    setName("My Strategy"); setSymbol("BTCUSDT"); setTimeframe("15m"); setCapital("1000");
    setConditions(initialConditions); setRunning(false); setTested(false);
  };

  return (
    <main className="min-h-[calc(100vh-56px)] bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrainCircuit size={22} />
            <div><h1 className="text-xl font-semibold">{name}</h1><p className="text-sm text-[#777]">Strategy builder</p></div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="flex items-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-sm text-[#aaa]"><RotateCcw size={15}/>Reset</button>
            <button type="button" onClick={() => setRunning((v) => !v)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">
              {running ? <Pause size={15}/> : <Play size={15}/>} {running ? "Pause Algo" : "Run Algo"}
            </button>
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

            <div className="mt-6 flex items-center justify-between"><h2 className="font-semibold">Entry conditions</h2><button type="button" onClick={addCondition} className="flex items-center gap-1 rounded-lg border border-[#333] px-3 py-1.5 text-sm text-[#aaa]"><Plus size={14}/>Add</button></div>
            <div className="mt-3 space-y-2">{conditions.map((c)=><div key={c.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr_1fr_auto]">
              <select value={c.indicator} onChange={(e)=>updateCondition(c.id,{indicator:e.target.value as Condition["indicator"]})} className="rounded-lg border border-[#333] bg-black px-3 py-2"><option>RSI</option><option>EMA</option></select>
              <select value={c.operator} onChange={(e)=>updateCondition(c.id,{operator:e.target.value as Condition["operator"]})} className="rounded-lg border border-[#333] bg-black px-3 py-2"><option>&gt;</option><option>&lt;</option><option>crosses above</option><option>crosses below</option></select>
              <input value={c.value} onChange={(e)=>updateCondition(c.id,{value:e.target.value})} className="rounded-lg border border-[#333] bg-black px-3 py-2" placeholder="Value"/>
              <button type="button" onClick={()=>removeCondition(c.id)} className="rounded-lg border border-[#333] px-3 text-[#777]"><Trash2 size={16}/></button>
            </div>)}</div>

            <div className="mt-6"><h2 className="mb-3 font-semibold">Exit rules</h2><div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-[#aaa]">Take profit %<input type="number" defaultValue="2" className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2"/></label>
              <label className="text-sm text-[#aaa]">Stop loss %<input type="number" defaultValue="1" className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-2"/></label>
            </div></div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-xl border border-[#222] bg-[#080808] p-5">
              <h2 className="mb-4 font-semibold">Backtest</h2>
              <button type="button" onClick={()=>setTested(true)} className="w-full rounded-lg bg-white py-2.5 font-semibold text-black">Run backtest</button>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Win rate</p><p className="mt-1 text-xl">{tested ? "72%" : "--"}</p></div>
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Return</p><p className="mt-1 text-xl">{tested ? "+12.4%" : "--"}</p></div>
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Trades</p><p className="mt-1 text-xl">{tested ? "42" : "--"}</p></div>
                <div className="rounded-lg border border-[#222] p-3"><p className="text-xs text-[#777]">Capital</p><p className="mt-1 text-xl">{`$${capital || "0"}`}</p></div>
              </div>
              <p className="mt-3 text-xs text-[#666]">Demo metrics only. No real exchange order is submitted.</p>
            </section>
            <section className="rounded-xl border border-[#222] bg-[#080808] p-5">
              <h2 className="mb-3 font-semibold">Algo status</h2>
              <div className="flex items-center justify-between rounded-lg border border-[#222] px-3 py-3">
                <span className="text-sm text-[#aaa]">{symbol} · {timeframe}</span>
                <span className={running ? "text-sm text-green-400" : "text-sm text-[#777]"}>{running ? "Running" : "Stopped"}</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
