"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Minus, MoveRight, Square, Triangle, Type, Trash2, ChevronDown, Ruler, GitBranch, PenLine, Undo2 } from "lucide-react";
import { DRAWING_CATEGORIES, DRAWING_TOOL_CATALOG } from "./DrawingToolCatalog";

type Pt = { x: number; y: number };
type Draw = { tool: string; a: Pt; b?: Pt; text?: string };
const QUICK = ["Cross", "Trend line", "Ray", "Horizontal line", "Vertical line", "Rectangle", "Fibonacci retracement", "Price range", "Text"];
const ICONS = [Crosshair, Minus, MoveRight, Square, Triangle, Type, Ruler, GitBranch, PenLine];
const FIB = [0, .236, .382, .5, .618, .786, 1];
const onePoint = (tool: string) => ["Horizontal line", "Vertical line", "Cross", "Dot", "Text", "Note", "Anchored note", "Price note", "Comment", "Callout", "Arrow marker", "Arrow marks", "Magic", "Eraser"].includes(tool);

export function DrawingToolbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [drawings, setDrawings] = useState<Draw[]>([]);
  const [draft, setDraft] = useState<Pt | null>(null);
  const [cursor, setCursor] = useState<Pt | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const clear = () => { setDrawings([]); setDraft(null); setCursor(null); };
    window.addEventListener("jk-clear-drawings", clear);
    return () => window.removeEventListener("jk-clear-drawings", clear);
  }, []);

  const point = (e: { clientX: number; clientY: number }) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: Math.max(0, Math.min(r.width, e.clientX - r.left)), y: Math.max(0, Math.min(r.height, e.clientY - r.top)) };
  };

  const choose = (name: string) => {
    setActive(v => v === name ? "" : name);
    setOpen(false);
    setDraft(null);
    setCursor(null);
  };

  const addOne = (tool: string, p: Pt) => {
    if (["Text", "Note", "Anchored note", "Price note", "Comment", "Callout"].includes(tool)) {
      const text = window.prompt("Enter text:");
      if (!text?.trim()) return;
      setDrawings(ds => [...ds, { tool, a: p, b: p, text: text.trim() }]);
      return;
    }
    setDrawings(ds => [...ds, { tool, a: p, b: p }]);
  };

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || (e.target instanceof HTMLElement && e.target.closest("button"))) return;
    const p = point(e);
    if (!p) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    setCursor(p);
    if (active === "Eraser") { setDrawings(ds => ds.slice(0, -1)); drawing.current = false; return; }
    if (onePoint(active)) { addOne(active, p); drawing.current = false; return; }
    setDraft(p);
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active) return;
    const p = point(e);
    if (p) setCursor(p);
  };

  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || !draft) return;
    const p = point(e);
    if (p && Math.hypot(p.x - draft.x, p.y - draft.y) >= 3) setDrawings(ds => [...ds, { tool: active, a: draft, b: p }]);
    setDraft(null);
    drawing.current = false;
  };

  const shape = (d: Draw, i: number) => {
    const a = d.a, b = d.b || d.a;
    const common = { key: i, stroke: "#fff", strokeWidth: 1.5, fill: "none", vectorEffect: "non-scaling-stroke" as const };
    if (["Horizontal line", "Horizontal ray line"].includes(d.tool)) return <line {...common} x1="0" y1={a.y} x2="100%" y2={a.y} />;
    if (d.tool === "Horizontal segment") return <line {...common} x1={a.x} y1={a.y} x2={b.x} y2={a.y} />;
    if (["Vertical line", "Vertical ray line"].includes(d.tool)) return <line {...common} x1={a.x} y1="0" x2={a.x} y2="100%" />;
    if (d.tool === "Vertical segment") return <line {...common} x1={a.x} y1={a.y} x2={a.x} y2={b.y} />;
    if (["Cross", "Crossline"].includes(d.tool)) return <g key={i}><line {...common} x1={d.tool === "Crossline" ? 0 : a.x - 10} y1={a.y} x2={d.tool === "Crossline" ? "100%" : a.x + 10} y2={a.y} /><line {...common} x1={a.x} y1={d.tool === "Crossline" ? 0 : a.y - 10} x2={a.x} y2={d.tool === "Crossline" ? "100%" : a.y + 10} /></g>;
    if (["Rectangle", "Gann box"].includes(d.tool)) return <rect {...common} x={Math.min(a.x,b.x)} y={Math.min(a.y,b.y)} width={Math.abs(b.x-a.x)} height={Math.abs(b.y-a.y)} />;
    if (["Circle", "Ellipse"].includes(d.tool)) return <ellipse {...common} cx={(a.x+b.x)/2} cy={(a.y+b.y)/2} rx={Math.abs(b.x-a.x)/2} ry={Math.abs(b.y-a.y)/2} />;
    if (d.tool === "Triangle") return <polygon {...common} points={`${a.x},${b.y} ${(a.x+b.x)/2},${a.y} ${b.x},${b.y}`} />;
    if (["Fibonacci retracement", "Fibonacci extension", "Fib channel"].includes(d.tool)) return <g key={i}><line {...common} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />{FIB.map((level,j) => { const y=a.y+(b.y-a.y)*level; return <g key={j}><line x1={a.x} y1={y} x2={b.x} y2={y} stroke="#aaa" strokeWidth="1" /><text x={b.x+5} y={y-3} fill="#aaa" fontSize="10">{Math.round(level*100)}%</text></g>; })}</g>;
    if (["Arrow", "Trend line", "Info line", "Extended line", "Trend angle", "Ray", "Arrow marker", "Price range", "Date range", "Date and price range", "Parallel channel", "Regression trend", "Pitchfan", "Gann fan", "Segment", "Straight line", "Parallel straight line"].includes(d.tool)) { const end=d.tool === "Ray" ? {x:a.x+(b.x-a.x)*4,y:a.y+(b.y-a.y)*4} : b; return <line {...common} x1={a.x} y1={a.y} x2={end.x} y2={end.y} />; }
    if (["Text", "Note", "Anchored note", "Price note", "Comment", "Callout"].includes(d.tool)) return <text key={i} x={a.x} y={a.y} fill="#fff" fontSize="12">{d.text || d.tool}</text>;
    return <line {...common} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
  };

  const preview = draft && cursor ? shape({ tool: active, a: draft, b: cursor }, 99999) : null;
  return <div ref={box} className={`absolute inset-0 z-[75] ${active ? "pointer-events-auto" : "pointer-events-none"}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { setDraft(null); drawing.current=false; }} style={{ touchAction: active ? "none" : "auto" }}>
    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col rounded-lg border border-[#333] bg-[#080808]/95 shadow-2xl backdrop-blur-sm overflow-visible">
      {QUICK.map((name,i) => { const I=ICONS[i]; return <button key={name} type="button" title={name} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();choose(name)}} className={`w-9 h-9 flex items-center justify-center border-b border-[#222] ${active===name ? "bg-[#222] text-white" : "text-[#aaa] hover:bg-[#171717] hover:text-white"}`}><I size={16}/></button>; })}
      <button type="button" title="Undo" onPointerDown={e=>e.stopPropagation()} onClick={()=>setDrawings(ds=>ds.slice(0,-1))} className="w-9 h-8 flex items-center justify-center border-b border-[#222] text-[#aaa] hover:text-white"><Undo2 size={15}/></button>
      <button type="button" title="More drawing tools" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();setOpen(v=>!v)}} className="w-9 h-9 flex items-center justify-center text-[#aaa] hover:bg-[#171717] hover:text-white"><ChevronDown size={15}/></button>
      {open && <div className="absolute left-11 top-0 w-64 max-h-[80vh] overflow-y-auto rounded-lg border border-[#333] bg-[#090909] shadow-2xl p-2 pointer-events-auto"><div className="px-2 py-1 text-[11px] uppercase tracking-wider text-[#777]">All drawing tools</div>{DRAWING_CATEGORIES.map(cat=><div key={cat} className="mb-2"><div className="px-2 py-1 text-xs font-semibold text-[#aaa]">{cat}</div>{DRAWING_TOOL_CATALOG.filter(x=>x.category===cat).map(t=><button key={`${cat}-${t.name}`} type="button" onClick={()=>choose(t.name)} className={`w-full rounded px-2 py-1.5 text-left text-xs ${active===t.name ? "bg-[#222] text-white" : "text-[#bbb] hover:bg-[#171717] hover:text-white"}`}>{t.name}</button>)}</div>)}<button type="button" onClick={()=>{setDrawings([]);setDraft(null);setOpen(false)}} className="sticky bottom-0 w-full mt-1 rounded border border-red-900/60 bg-[#120606] px-2 py-2 text-xs text-red-300 flex items-center gap-2"><Trash2 size={13}/> Clear drawings</button></div>}
    </div>
    {(drawings.length > 0 || preview) && <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">{drawings.map(shape)}{preview}</svg>}
    {active && cursor && <div className="absolute pointer-events-none" style={{left:cursor.x,top:cursor.y}}><div className="absolute -left-3 -top-px w-6 h-px bg-white/70"/><div className="absolute -top-3 -left-px w-px h-6 bg-white/70"/></div>}
  </div>;
}
