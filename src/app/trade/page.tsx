"use client";

import { useEffect, useState } from "react";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";

type Tab = "Position" | "Pending Order" | "Closed";
type OrderSide = "Buy" | "Sell";
type PaperOrder = { id: string; side: OrderSide; symbol: string; quantity: string; status: string; source: string };

export default function TradePage() {
  const [tab, setTab] = useState<Tab>("Position");
  const [orders, setOrders] = useState<PaperOrder[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const account = JSON.parse(localStorage.getItem("jk-paper-account") || '{"orders":[]}');
        setOrders(Array.isArray(account.orders) ? account.orders : []);
      } catch { setOrders([]); }
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const tabs: Tab[] = ["Position", "Pending Order", "Closed"];
  const positions = orders.filter((order) => order.status === "Open");
  const pending = orders.filter((order) => order.status === "Pending");
  const closed = orders.filter((order) => order.status === "Closed");
  const visible = tab === "Position" ? positions : tab === "Pending Order" ? pending : closed;

  return (
    <main className="min-h-[calc(100vh-56px)] bg-black text-white">
      <section className="border-b border-[#222] bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-4 sm:px-6">
          <div className="flex items-center gap-2 text-2xl font-medium"><span>$0.00</span><span className="text-xl text-[#888]">0.00</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl bg-black">
        <div className="grid grid-cols-3 border-b border-[#222]">
          {tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`relative py-5 text-center text-base sm:text-lg ${tab === item ? "font-semibold text-white" : "text-[#777]"}`}>{item}{tab === item && <span className="absolute bottom-0 left-1/2 h-1 w-11 -translate-x-1/2 rounded-full bg-white" />}</button>)}
        </div>

        <div className="flex min-h-[calc(100vh-180px)] flex-col items-center justify-center px-6 py-20">
          {visible.length > 0 ? <div className="w-full max-w-xl space-y-3">{visible.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-xl border border-[#282828] bg-[#090909] p-4">
              <div className="flex items-center gap-3">{order.side === "Buy" ? <TrendingUp className="text-green-500"/> : <TrendingDown className="text-red-500"/>}<div><p className="font-semibold">{order.symbol}</p><p className="text-sm text-[#777]">{order.quantity} • {order.side} • {order.source}</p></div></div>
              <span className="rounded-full bg-[#151515] px-3 py-1 text-sm text-[#aaa]">{order.status}</span>
            </div>
          ))}</div> : <><div className="mb-5 flex h-28 w-28 items-center justify-center text-[#333]"><FileText size={96} strokeWidth={1.2}/></div><p className="text-xl text-[#777]">{tab === "Position" ? "Currently no position" : tab === "Pending Order" ? "Currently no pending order" : "Currently no closed position"}</p></>}
        </div>
      </section>
    </main>
  );
}
