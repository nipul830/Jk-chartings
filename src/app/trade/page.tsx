"use client";

import {
  ArrowLeftRight,
  ChevronDown,
  FileText,
  Compass,
  Home,
  User,
  CandlestickChart,
} from "lucide-react";

export default function TradePage() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#f7f7f7] text-[#17212b] pb-20">
      <section className="bg-[#ffc800]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button className="rounded-lg bg-[#101820] px-3 py-1.5 text-lg font-bold text-[#ffc800]">
            Standard
          </button>

          <div className="flex items-center gap-2 text-2xl font-medium">
            <span>$0.17</span>
            <span className="text-xl">0.00</span>
          </div>

          <button
            type="button"
            aria-label="Switch account"
            className="rounded-lg p-2 hover:bg-black/10"
          >
            <ArrowLeftRight size={27} />
          </button>
        </div>

        <div className="flex justify-center pb-2">
          <button
            type="button"
            aria-label="Expand account panel"
            className="rounded-t-lg bg-[#ffd83d] px-6 py-1"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl bg-white">
        <div className="grid grid-cols-3 border-b border-[#eee]">
          {["Position", "Pending Order", "Closed"].map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`relative py-5 text-center text-base sm:text-lg ${index === 0 ? "font-semibold text-[#17212b]" : "text-[#8b9298]"}`}
            >
              {tab}
              {index === 0 && (
                <span className="absolute bottom-0 left-1/2 h-1 w-11 -translate-x-1/2 rounded-full bg-[#ffc800]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex min-h-[calc(100vh-300px)] flex-col items-center justify-center px-6 py-20">
          <div className="mb-5 flex h-28 w-28 items-center justify-center text-[#e6e8ea]">
            <FileText size={96} strokeWidth={1.2} />
          </div>

          <p className="mb-10 text-xl text-[#7d858b]">Currently no position</p>

          <button
            type="button"
            className="rounded-full bg-[#ffc800] px-11 py-3 text-lg font-medium text-[#101820] shadow-sm transition hover:bg-[#f2bc00]"
          >
            Open position
          </button>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e4e4e4] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-5">
          {[
            { label: "Home", icon: Home },
            { label: "Market", icon: CandlestickChart },
            { label: "Trade", icon: FileText, active: true },
            { label: "Discover", icon: Compass },
            { label: "Account", icon: User },
          ].map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`flex flex-col items-center gap-1 py-2 text-xs sm:text-sm ${active ? "text-[#101820]" : "text-[#7d858b]"}`}
            >
              <Icon size={25} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
