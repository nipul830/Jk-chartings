"use client";

import { useState } from "react";
import { FileText, X, TrendingUp, TrendingDown } from "lucide-react";

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
    setOrders((current) => [...current, { side, symbol: symbol.trim().toUpperCase(), quantity, status: "Open" }]);
    setOpenOrder(false);
    setTab("Position");
  };

  const tabs: Tab[] = ["Position", "Pending Order", "Closed"];

  return (
    <main className="min-h-[calc(100vh-56px)] bg-black text-white">
      <section className="border-b border-[#222] bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-4 sm:px-6">
          <div className="flex items-center gap-2 text-2xl font-medium"><span>$0.00</span><span className="text-xl text-[#888]">0.00</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl bg-black">
        <div className="grid grid-cols-3 border-b border-[#222]">
          {tabs.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`relative py-5 text-center text-base sm:text-lg ${tab === item ? "font-semibold text-white" : "text-[#777]"}`}>
              {item}
              {tab === item && <span className="absolute bottom-0 left-1/2 h-1 w-11 -translate-x-1/2 rounded-full bg-white" />}
            </button>
          ))}
        </div>

        <div className="flex min-h-[calc(100vh-180px)] flex-col items-center justify-center px-6 py-20">
          {tab === "Position" && orders.length > 0 ? (
            <div className="w-full max-w-xl space-y-3">
              {orders.map((order, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl border border-[#282828] bg-[#090909] p-4">
                  <div className="flex items-center gap-3">
                    {order.side === "Buy" ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
                    <div><p className="font-semibold">{order.symbol}</p><p className="text-sm text-[#777]">{order.quantity} • {order.side}</p></div>
                  </div>
                  <span className="rounded-full bg-[#151515] px-3 py-1 text-sm text-[#aaa]">{order.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-5 flex h-28 w-28 items-center justify-center text-[#333]"><FileText size={96} strokeWidth={1.2} /></div>
              <p className="text-xl text-[#777]">{tab === "Position" ? "Currently no position" : tab === "Pending Order" ? "Currently no pending order" : "Currently no closed position"}</p>
            </>
          )}
        </div>
      </section>

      {openOrder && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl border border-[#292929] bg-[#0b0b0b] p-5 sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Open position</h2><button type="button" onClick={() => setOpenOrder(false)} aria-label="Close" className="text-[#888] hover:text-white"><X /></button></div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSide("Buy")} className={`rounded-lg border py-3 font-semibold ${side === "Buy" ? "border-green-600 bg-green-600 text-white" : "border-[#333] bg-[#151515] text-[#aaa]"}`}>Buy</button>
              <button type="button" onClick={() => setSide("Sell")} className={`rounded-lg border py-3 font-semibold ${side === "Sell" ? "border-red-600 bg-red-600 text-white" : "border-[#333] bg-[#151515] text-[#aaa]"}`}>Sell</button>
            </div>
            <label className="mb-3 block text-sm text-[#aaa]">Symbol<input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-3 text-white outline-none focus:border-[#777]" /></label>
            <label className="mb-5 block text-sm text-[#aaa]">Quantity<input type="number" min="0.000001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full rounded-lg border border-[#333] bg-black px-3 py-3 text-white outline-none focus:border-[#777]" /></label>
            <button type="button" onClick={placeOrder} className="w-full rounded-lg bg-white py-3 text-lg font-semibold text-black transition hover:bg-[#ddd]">Place {side} order</button>
          </div>
        </div>
      )}
    </main>
  );
}
