"use client";

interface Props {
  value: string;
  onChange: (tf: string) => void;
}

const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D"];

export function TimeframeSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {timeframes.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-2.5 h-7 text-xs rounded border transition-colors ${
            value === tf
              ? "bg-white text-black border-white"
              : "border-[#333] text-[#aaa] hover:border-white hover:text-white"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
