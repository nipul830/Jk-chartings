"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/chart")) {
      const target = `${window.location.origin}/Jk-chartings/chart/`;
      if (path !== "/Jk-chartings/chart/") window.location.replace(target);
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <span className="text-sm text-[#777]">Loading chart...</span>
    </main>
  );
}
