"use client";

import {useState} from "react";

interface Props {
  value: string;
  onChange: (tf: string) => void;
}

const timeframes = [
  {value:"1m",label:"1"},
  {value:"3m",label:"3"},
  {value:"5m",label:"5"},
  {value:"15m",label:"15"},
  {value:"30m",label:"30"},
  {value:"1H",label:"1H"},
  {value:"4H",label:"4H"},
  {value:"1D",label:"1D"},
  {value:"1W",label:"1W"},
  {value:"1M",label:"1M"},
];

export function TimeframeSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = timeframes.find((tf) => tf.value === value) || timeframes[3];

  return (
    <div className="relative">
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="h-7 min-w-[42px] px-2 text-xs font-medium rounded border border-[#333] bg-black text-white"
      >
        {selected.label} ▾
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-[100] max-w-[calc(100vw-24px)] rounded-md border border-[#333] bg-[#080808] p-1 shadow-xl"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex max-w-[calc(100vw-40px)] items-center gap-1 overflow-x-auto overscroll-contain scrollbar-thin">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                type="button"
                onClick={() => { onChange(tf.value); setOpen(false); }}
                className={`shrink-0 px-2.5 h-7 text-xs rounded border transition-colors ${
                  value === tf.value
                    ? "bg-white text-black border-white"
                    : "border-[#333] text-[#aaa] hover:border-white hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
