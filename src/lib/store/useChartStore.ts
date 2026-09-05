import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LayoutType = 1 | 2 | 4 | 6;

export interface ChartConfig {
  id: string;
  symbol: string;
  timeframe: string;
  indicators: string[];
}

interface ChartState {
  layout: LayoutType;
  charts: ChartConfig[];
  setLayout: (layout: LayoutType) => void;
  updateChart: (id: string, updates: Partial<ChartConfig>) => void;
  setChartSymbol: (id: string, symbol: string) => void;
}

const defaultCharts = (count: number, symbol = "BTCUSDT"): ChartConfig[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `chart-${i}`,
    symbol,
    timeframe: "15m",
    indicators: ["EMA", "Volume"],
  }));

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      layout: 1,
      charts: defaultCharts(1),
      setLayout: (layout) =>
        set((state) => {
          const current = state.charts;
          const needed = layout;
          let charts = current.slice(0, needed);
          while (charts.length < needed) {
            charts.push({
              id: `chart-${charts.length}`,
              symbol: "BTCUSDT",
              timeframe: "15m",
              indicators: ["EMA"],
            });
          }
          return { layout, charts };
        }),
      updateChart: (id, updates) =>
        set((state) => ({
          charts: state.charts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      setChartSymbol: (id, symbol) =>
        set((state) => ({
          charts: state.charts.map((c) =>
            c.id === id ? { ...c, symbol } : c
          ),
        })),
    }),
    {
      name: "jk-chart-store",
    }
  )
);
