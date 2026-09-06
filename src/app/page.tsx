"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/useWatchlistStore";

const DEFAULT_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "XAUUSD",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "USDCAD",
  "AUDUSD",
  "NZDUSD",
];

const BiquoteSymbols = new Set(["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD"]);

export default function HomePage() {
  const router = useRouter();
  const { symbols, addSymbol, setSymbols } = useWatchlistStore();
  const [search, setSearch] = useState("");
  const [prices, setPrices] = useState<Record<string, { price: string; change: number }>>({});
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (symbols.length === 0) setSymbols(DEFAULT_SYMBOLS);
  }, [symbols.length, setSymbols]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const cryptoSymbols = symbols.filter((s) => !BiquoteSymbols.has(s));
        const forexSymbols = symbols.filter((s) => BiquoteSymbols.has(s));
        const map: Record<string, { price: string; change: number }> = {};

        if (cryptoSymbols.length) {
          const res = await fetch("https://api.binance.com/api/v3/ticker/24hr", { cache: "no-store" });
          const data = await res.json();
          data.forEach((item: any) => {
            if (cryptoSymbols.includes(item.symbol)) {
              map[item.symbol] = {
                price: parseFloat(item.lastPrice).toFixed(item.symbol.includes("BTC") || item.symbol.includes("ETH") ? 2 : 4),
                change: parseFloat(item.priceChangePercent),
              };
            }
          });
        }

        if (forexSymbols.length) {
          const params = new URLSearchParams();
          forexSymbols.forEach((s) => params.append("symbols", s));
          const res = await fetch(`https://biquote.io/api/latest?${params.toString()}`, { cache: "no-store" });
          const data = await res.json();
          Object.entries(data).forEach(([sym, item]: [string, any]) => {
            const price = Number(item?.mid);
            if (Number.isFinite(price)) {
              map[sym] = {
                price: price.toFixed(sym === "USDJPY" ? 3 : 5),
                change: Number(item?.dayDiffPercent) || 0,
              };
            }
          });
        }

        setPrices(map);
      } catch (e) {
        console.error(e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [symbols]);

  const filtered = DEFAULT_SYMBOLS.filter(
    (s) => s.toLowerCase().includes(search.toLowerCase()) && !symbols.includes(s)
  );

  const handleAdd = (sym: string) => {
    addSymbol(sym);
    setSearch("");
    setShowSearch(false);
  };

  const displaySymbol = (sym: string) => {
    if (sym.endsWith("USDT")) return <>{sym.replace("USDT", "")}<span className="text-[#555] text-xs">/USDT</span></>;
    if (sym.endsWith("USD") && sym.length === 6) return <>{sym.slice(0, 3)}<span className="text-[#555] text-xs">/{sym.slice(3)}</span></>;
    return sym;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Watchlist</h1>
        <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-sm font-medium rounded hover:bg-gray-200 transition">
          <Plus size={16} /> Add Symbol
        </button>
      </div>

      {showSearch && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-24 px-4">
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg w-full max-w-md p-4">
            <div className="flex items-center gap-2 mb-4 border border-[#333] rounded px-3 py-2">
              <Search size={16} className="text-[#888]" />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symbol (e.g. EURUSD)" className="bg-transparent outline-none flex-1 text-sm" />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.map((sym) => (
                <button key={sym} onClick={() => handleAdd(sym)} className="w-full text-left px-3 py-2 hover:bg-[#111] rounded text-sm flex justify-between">
                  <span>{sym}</span><span className="text-[#888]">Add</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-[#666] text-sm text-center py-4">No symbols found</p>}
            </div>
            <button onClick={() => setShowSearch(false)} className="mt-3 w-full py-2 border border-[#333] rounded text-sm hover:bg-[#111]">Close</button>
          </div>
        </div>
      )}

      <div className="border border-[#222] rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-[#888] border-b border-[#222] bg-[#0a0a0a]">
          <div className="col-span-5">Symbol</div><div className="col-span-4 text-right">Price</div><div className="col-span-3 text-right">24h %</div>
        </div>

        {symbols.map((sym) => {
          const data = prices[sym];
          const change = data?.change ?? 0;
          const isPositive = change >= 0;
          return (
            <div key={sym} onClick={() => router.push(`/chart?symbol=${sym}`)} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[#1a1a1a] hover:bg-[#0a0a0a] cursor-pointer transition-colors group">
              <div className="col-span-5 font-medium flex items-center gap-2">{displaySymbol(sym)}</div>
              <div className="col-span-4 text-right font-mono">{data ? data.price : "—"}</div>
              <div className={`col-span-3 text-right font-mono flex items-center justify-end gap-1 ${isPositive ? "text-white" : "text-[#888]"}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {data ? `${isPositive ? "+" : ""}${change.toFixed(2)}%` : "—"}
              </div>
            </div>
          );
        })}

        {symbols.length === 0 && <div className="py-12 text-center text-[#555]">No symbols in watchlist. Click “Add Symbol”.</div>}
      </div>
    </div>
  );
}
