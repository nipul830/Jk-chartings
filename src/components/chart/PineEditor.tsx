"use client";

import { useEffect, useState } from "react";
import { Code2, Play, X, Save, Trash2 } from "lucide-react";

const DEFAULT_CODE = `//@version=6
indicator("My Custom Indicator", overlay=true)

length = input.int(20, "Length")
emaLine = ta.ema(close, length)

plot(emaLine, title="EMA", color=color.white, linewidth=2)`;

type Script = { id: string; name: string; code: string };

export function PineEditor() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [name, setName] = useState("My Custom Indicator");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("jk-pine-scripts") || "[]");
      if (Array.isArray(saved)) setScripts(saved);
    } catch {}
  }, []);

  const openEditor = () => {
    window.dispatchEvent(new Event("jk-pine-opened"));
    setOpen(true);
  };

  const save = () => {
    const item: Script = { id: crypto.randomUUID(), name: name.trim() || "Custom Pine", code };
    const next = [...scripts.filter(s => s.name !== item.name), item];
    setScripts(next);
    localStorage.setItem("jk-pine-scripts", JSON.stringify(next));
    localStorage.setItem("jk-active-pine", JSON.stringify(item));
    window.dispatchEvent(new Event("jk-pine-changed"));
    setMessage("Saved • ready to add to chart");
  };

  const run = () => {
    if (!code.includes("indicator(") && !code.includes("strategy(")) {
      setMessage("Error: add indicator() or strategy() first");
      return;
    }
    save();
    setMessage("Compiled • active Pine script updated");
  };

  const load = (s: Script) => {
    setName(s.name);
    setCode(s.code);
    localStorage.setItem("jk-active-pine", JSON.stringify(s));
    window.dispatchEvent(new Event("jk-pine-changed"));
    setMessage(`Loaded ${s.name}`);
  };

  const remove = (id: string) => {
    const next = scripts.filter(s => s.id !== id);
    setScripts(next);
    localStorage.setItem("jk-pine-scripts", JSON.stringify(next));
  };

  return <>
    <button type="button" title="Pine Editor" onClick={openEditor} className="h-9 px-3 rounded-md border border-[#333] bg-[#0d0d0d] text-[#aaa] flex items-center gap-2 text-sm hover:text-white hover:border-white">
      <Code2 size={16} /> <span className="hidden sm:inline">Pine</span>
    </button>

    {open && <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-3 sm:p-6" onClick={() => setOpen(false)} onPointerDown={e => e.stopPropagation()}>
      <div className="w-full max-w-6xl h-[90vh] rounded-xl border border-[#333] bg-[#080808] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
        <div className="h-12 shrink-0 border-b border-[#222] flex items-center gap-2 px-3">
          <Code2 size={18} className="text-white" />
          <span className="font-semibold text-sm">Pine Editor</span>
          <input value={name} onChange={e => setName(e.target.value)} className="ml-2 w-52 max-w-[35vw] rounded border border-[#333] bg-black px-2 py-1 text-xs outline-none focus:border-white" placeholder="Script name" />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={save} className="h-8 px-3 rounded border border-[#333] text-xs text-[#aaa] hover:text-white"><Save size={14} className="inline mr-1" />Save</button>
            <button onClick={run} className="h-8 px-3 rounded bg-white text-black text-xs font-semibold hover:bg-[#ddd]"><Play size={14} className="inline mr-1" />Run</button>
            <button onClick={() => setOpen(false)} className="h-8 w-8 rounded border border-[#333] text-[#aaa] flex items-center justify-center hover:text-white"><X size={16} /></button>
          </div>
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_240px]">
          <div className="min-w-0 min-h-0 relative bg-[#050505]">
            <div className="absolute top-2 left-3 z-10 text-[10px] text-[#666]">Pine Script • custom indicator</div>
            <textarea spellCheck={false} value={code} onChange={e => setCode(e.target.value)} className="w-full h-full resize-none bg-transparent pt-8 px-4 pb-4 text-[13px] leading-6 font-mono text-[#e8e8e8] outline-none" />
          </div>
          <aside className="border-t md:border-t-0 md:border-l border-[#222] min-h-0 flex flex-col">
            <div className="px-3 py-3 border-b border-[#222] text-xs font-semibold">Saved scripts</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {scripts.map(s => <div key={s.id} className="group flex items-center gap-1 rounded border border-transparent hover:border-[#333] hover:bg-[#0d0d0d]">
                <button onClick={() => load(s)} className="flex-1 text-left px-2 py-2 text-xs text-[#bbb] truncate hover:text-white">{s.name}</button>
                <button onClick={() => remove(s.id)} title="Delete" className="p-2 text-[#555] hover:text-white"><Trash2 size={13} /></button>
              </div>)}
              {scripts.length === 0 && <div className="px-2 py-4 text-[11px] text-[#555]">No saved scripts</div>}
            </div>
            {message && <div className="border-t border-[#222] px-3 py-2 text-[10px] text-[#999]">{message}</div>}
          </aside>
        </div>
      </div>
    </div>}
  </>;
}
