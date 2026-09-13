# Paper Trading Bot

A fully working AI-driven paper trading simulator built with Next.js 14, TypeScript, and Tailwind CSS. Uses **real market data** from Binance's public API and computes real technical indicators (RSI, MACD, EMA, Bollinger Bands) to generate trading signals.

> ⚠️ **This is a paper trading simulator. No real money is ever used.**

## Features

- 🔐 Login with username + Demo/Live (paper) mode
- 💰 Live balance, P&L, and equity curve
- 📡 Real-time market scanner (10 crypto pairs)
- 🧠 AI signal generation using RSI, MACD, EMA(20/50), Bollinger Bands
- ⚙️ Configurable rules: stake, duration, target profit, stop loss, signal threshold, max open trades, enabled markets
- 📋 Full trade log with win rate stats
- ▶️ / ⏸ Start/stop bot control
- 📱 Fully responsive
- 💾 State persisted in localStorage

## Trading Logic

- Fetches 1-minute candles from Binance every 15 seconds
- Computes 4 indicators per market, combines into a signal score (-100 to +100)
- Opens a binary-style paper trade when |score| ≥ threshold (default 60)
- Trade closes after configured duration (default 60s)
- Win pays 85% of stake, loss loses 100% (realistic binary payout)
- Auto-stops at target profit or stop loss

## Local Development

    npm install
    npm run dev

Open http://localhost:3000

## Deploy to Vercel

    npm install -g vercel
    vercel

Or connect your GitHub repo at vercel.com/new.

## Disclaimer

For educational purposes only. Not financial advice.
"# Boottt" 
