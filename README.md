# Jk-Chartings (MonoTrade)

Black & White Trading Chart Analysis Platform

## Features

- **Watchlist** with live price & % change (TradingView style)
- **Symbol Search**
- **Multi-Layout Charts**: 1 / 2 / 4 / 6 panes
- Each chart is fully independent (symbol, timeframe, indicators)
- **Drawing Tools**: Trendline, Horizontal/Vertical line, Fibonacci, Rectangle
- **Technical Indicators**: SMA, EMA, RSI, MACD, Bollinger Bands, Volume
- **Settings Page**
- Pure **Black & White** theme
- Free **Binance API** (Crypto)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- TradingView Lightweight Charts
- Zustand (state management)
- Lucide React (icons)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Watchlist Home
│   ├── chart/page.tsx        # Multi-layout Charts
│   └── settings/page.tsx
├── components/
│   ├── layout/
│   ├── watchlist/
│   ├── chart/
│   └── ui/
├── lib/
│   ├── api/binance.ts
│   ├── store/
│   └── utils.ts
├── hooks/
└── types/
\`\`\`

## Notes

- Currently focused on Crypto (Binance free public API)
- Drawing tools & advanced indicators are implemented in basic form
- PineScript support is planned for future

---

Made for clean, fast chart analysis.
