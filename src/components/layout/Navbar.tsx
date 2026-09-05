"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, Settings, Search, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("jk-theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggleTheme = () => {
    setDark((current) => {
      const next = !current;
      localStorage.setItem("jk-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("light", !next);
      return next;
    });
  };

  const links = [
    { href: "/", label: "Watchlist", icon: List },
    { href: "/chart", label: "Charts", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#222] h-14 flex items-center px-4">
      <div className="flex items-center gap-2 mr-8">
        <div className="w-7 h-7 bg-white text-black font-bold flex items-center justify-center text-sm">JK</div>
        <span className="font-semibold tracking-tight">Chartings</span>
      </div>
      <div className="flex items-center gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${active ? "bg-white text-black" : "text-[#aaa] hover:text-white hover:bg-[#111]"}`}>
              <Icon size={16} />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={toggleTheme} aria-label={dark ? "Switch to day mode" : "Switch to night mode"} title={dark ? "Day mode" : "Night mode"} className="w-9 h-9 flex items-center justify-center text-[#aaa] hover:text-white border border-[#333] rounded hover:border-white transition-colors">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <Link href="/chart" className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#aaa] hover:text-white border border-[#333] rounded hover:border-white transition-colors">
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
        </Link>
      </div>
    </nav>
  );
}
