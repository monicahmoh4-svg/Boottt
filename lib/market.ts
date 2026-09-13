import type { Candle, Market } from "./types";

export const WATCHLIST: { symbol: string; name: string }[] = [
  { symbol: "BTCUSDT", name: "Bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum" },
  { symbol: "SOLUSDT", name: "Solana" },
  { symbol: "BNBUSDT", name: "BNB" },
  { symbol: "XRPUSDT", name: "XRP" },
  { symbol: "ADAUSDT", name: "Cardano" },
  { symbol: "DOGEUSDT", name: "Dogecoin" },
  { symbol: "AVAXUSDT", name: "Avalanche" },
  { symbol: "MATICUSDT", name: "Polygon" },
  { symbol: "LINKUSDT", name: "Chainlink" },
];

export async function fetchCandles(symbol: string, interval = "1m", limit = 100): Promise<Candle[]> {
  const res = await fetch(`/api/market?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
  const raw = await res.json();
  return (raw as any[]).map((k) => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

export async function fetchMarket(symbol: string, name: string): Promise<Market> {
  const candles = await fetchCandles(symbol);
  const last = candles[candles.length - 1];
  const first = candles[0];
  const change24h = ((last.close - first.open) / first.open) * 100;
  return {
    symbol,
    name,
    price: last.close,
    change24h,
    candles,
    lastUpdate: Date.now(),
  };
}

export async function fetchAllMarkets(): Promise<Market[]> {
  const results = await Promise.allSettled(
    WATCHLIST.map((w) => fetchMarket(w.symbol, w.name))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Market> => r.status === "fulfilled")
    .map((r) => r.value);
}
