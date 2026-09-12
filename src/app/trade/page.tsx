"use client";

import { useState } from "react";
import {
  ArrowLeftRight, ChevronDown, FileText, Compass, Home, User,
  CandlestickChart, X, TrendingUp, TrendingDown
} from "lucide-react";

type Tab = "Position" | "Pending Order" | "Closed";
type OrderSide = "Buy" | "Sell";

export default function TradePage() {
  const [tab, setTab] = useState<Tab>("Position");
  const [openOrder, setOpenOrder] = useState(false);
  const [side, setSide] = useState<OrderSide>("Buy");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [quantity, setQuantity] = useState("0.001");
  const [orders, setOrders] = useState<{side: OrderSide; symbol: string; quantity: string; status: string}[]>([]);

  const placeOrder = () => {
    if (!symbol.trim() || !quantity || Number(quantity) <= 0) return;
    setOrders((current) => [
      ...current,
      { side, symbol: symbol.trim().toUpperCase(), quantity, status: "Open" },
    ]);
    setOpenOrder(false);
    setTab("Position");
  };

  const tabs: Tab[] = ["Position", "Pending Order", "Closed"];

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#f7f7f7] text-[#17212b] pb-20">
      <section className="bg-[#ffc800]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button type="button" className="rounded-lg bg-[#101820] px-3 py-1.5 text-lg font-bold text-[#ffc800]">Standard</button>
          <div className="flex items-center gap-2 text-2xl font-medium"><span>$0.17</span><span className="text-xl">0.00</span></div>
          <button type="button" aria-label="Switch account" className="rounded-lg p-2 hover:bg-black/10"><ArrowLeftRight size={27} /></button>
        </div>
        <div className="flex justify-center pb-2">
          <button type="button" aria-label="Expand account panel" className="rounded-t-lg bg-[#ffd83d] px-6 py-1"><ChevronDown size={24} /></button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl bg-white">
        <div className="grid grid-cols-3 border-b border-[#eee]">
          {tabs.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)}
              className={`relative py-5 text-center text-base sm:text-lg ${tab === item ? "font-semibold text-[#17212b]" : "text-[#8b9298]"}`}>
              {item}
              {tab === item && <span className="absolute bottom-0 left-1/2 h-1 w-11 -translate-x-1/2 rounded-full bg-[#ffc800]" />}
            </button>
          ))}
        </div>

        <div className="flex min-h-[calc(100vh-300px)] flex-col items-center justify-center px-6 py-20">
          {tab === "Position" && orders.length > 0 ? (
            <div className="w-full max-w-xl space-y-3">
              {orders.map((order, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl border border-[#e7e7e7] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {order.side === "Buy" ? <TrendingUp className="text-green-600" /> : <TrendingDown className="text-red-600" />}
                    <div><p className="font-semibold">{order.symbol}</p><p className="text-sm text-[#7d858b]">{order.quantity} • {order.side}</p></div>
                  </div>
                  <span className="rounded-full bg-[#eef8ee] px-3 py-1 text-sm">{order.status}</span>
                </div>
              ))}
              <button type="button" onClick={() => setOpenOrder(true)} className="mx-auto block rounded-full bg-[#ffc800] px-11 py-3 text-lg font-medium">Open position</button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex h-28 w-28 items-center justify-center text-[#e6e8ea]"><FileText size={96} strokeWidth={1.2} /></div>
              <p className="mb-10 text-xl text-[#7d858b]">
                {tab === "Position" ? "Currently no position" : tab === "Pending Order" ? "Currently no pending order" : "Currently no closed position"}
              </p>
              {tab === "Position" && (
                <button type="button" onClick={() => setOpenOrder(true)} className="rounded-full bg-[#ffc800] px-11 py-3 text-lg font-medium text-[#101820] shadow-sm transition hover:bg-[#f2bc00]">Open position</button>
              )}
            </>
          )}
        </div>
      </section>

      {openOrder && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Open position</h2>
              <button type="button" onClick={() => setOpenOrder(false)} aria-label="Close"><X /></button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSide("Buy")} className={`rounded-lg py-3 font-semibold ${side === "Buy" ? "bg-green-600 text-white" : "bg-[#f1f1f1]"}`}>Buy</button>
              <button type="button" onClick={() => setSide("Sell")} className={`rounded-lg py-3 font-semibold ${side === "Sell" ? "bg-red-600 text-white" : "bg-[#f1f1f1]"}`}>Sell</button>
            </div>
            <label className="mb-3 block text-sm">Symbol
              <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 w-full rounded-lg border border-[#ddd] px-3 py-3 outline-none focus:border-[#999]" />
            </label>
            <label className="mb-5 block text-sm">Quantity
              <input type="number" min="0.000001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full rounded-lg border border-[#ddd] px-3 py-3 outline-none focus:border-[#999]" />
            </label>
            <button type="button" onClick={placeOrder} className="w-full rounded-full bg-[#ffc800] py-3 text-lg font-semibold">Place {side} order</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e4e4e4] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-5">
          {[{label:"Home",icon:Home},{label:"Market",icon:CandlestickChart},{label:"Trade",icon:FileText,active:true},{label:"Discover",icon:Compass},{label:"Account",icon:User}].map(({label,icon:Icon,active}) => (
            <button key={label} type="button" className={`flex flex-col items-center gap-1 py-2 text-xs sm:text-sm ${active ? "text-[#101820]" : "text-[#7d858b]"}`}><Icon size={25} strokeWidth={active ? 2.5 : 1.8}/><span>{label}</span></button>
          ))}
        </div>
      </nav>
    </main>
  );
}
