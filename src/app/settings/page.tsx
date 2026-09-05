"use client";

export default function SettingsPage() {
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
              <p className="text-xs text-[#666]">Monochrome theme (fixed)</p>
            </div>
          </div>
        </section>

        <section className="border border-[#222] rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3 text-[#aaa]">Default Timeframe</h2>
          <select className="bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm w-full max-w-xs">
            <option>15m</option>
            <option>1H</option>
            <option>4H</option>
            <option>1D</option>
          </select>
        </section>

        <section className="border border-[#222] rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3 text-[#aaa]">About</h2>
          <p className="text-sm text-[#888]">
            Jk-Chartings – Clean multi-layout trading charts.<br />
            Data from Binance public API (free).<br />
            Drawing tools & custom indicators coming soon.
          </p>
        </section>
      </div>
    </div>
  );
}
