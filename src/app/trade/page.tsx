"use client";

import { ArrowLeftRight } from "lucide-react";

export default function TradePage() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-black px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="border border-[#222] rounded-lg bg-[#080808] p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowLeftRight size={20} />
            <h1 className="text-xl font-semibold">Trade</h1>
          </div>
          <p className="text-sm text-[#888]">
            Trade workspace is ready. Existing Chartings features remain unchanged.
          </p>
        </div>
      </div>
    </main>
  );
}
