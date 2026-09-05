"use client";

import { LayoutType } from "@/lib/store/useChartStore";

interface Props {
  value: LayoutType;
  onChange: (layout: LayoutType) => void;
}

const options: { value: LayoutType; label: string }[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 4, label: "4" },
  { value: 6, label: "6" },
];

export function LayoutSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-[#888] mr-1">Layout</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-8 h-7 text-xs rounded border transition-colors ${
            value === opt.value
              ? "bg-white text-black border-white"
              : "border-[#333] text-[#aaa] hover:border-white hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
