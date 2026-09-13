import type { Market, Signal } from "./types";
import { rsi, macd, ema, bollingerBands } from "./indicators";

export function analyze(market: Market): Signal {
  const closes = market.candles.map((c) => c.close);
  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];

  const rsiArr = rsi(closes, 14);
  const curRsi = rsiArr[rsiArr.length - 1];
  const prevRsi = rsiArr[rsiArr.length - 2];

  const m = macd(closes);
  const macdNow = m.histogram[m.histogram.length - 1];
  const macdPrev = m.histogram[m.histogram.length - 2];

  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema20Now = ema20[ema20.length - 1];
  const ema50Now = ema50[ema50.length - 1];

  const bb = bollingerBands(closes, 20, 2);
  const bbUpper = bb.upper[bb.upper.length - 1];
  const bbLower = bb.lower[bb.lower.length - 1];
  const bbMid = bb.mid[bb.mid.length - 1];

  let score = 0;
  const reasons: string[] = [];

  if (!isNaN(curRsi)) {
    if (curRsi < 30) { score += 25; reasons.push(`RSI oversold (${curRsi.toFixed(1)})`); }
    else if (curRsi > 70) { score -= 25; reasons.push(`RSI overbought (${curRsi.toFixed(1)})`); }
    else if (prevRsi < 50 && curRsi >= 50) { score += 10; reasons.push("RSI crossed 50 up"); }
    else if (prevRsi > 50 && curRsi <= 50) { score -= 10; reasons.push("RSI crossed 50 down"); }
  }

  if (macdNow > 0 && macdPrev <= 0) { score += 20; reasons.push("MACD bullish cross"); }
  else if (macdNow < 0 && macdPrev >= 0) { score -= 20; reasons.push("MACD bearish cross"); }
  else if (macdNow > macdPrev) { score += 5; reasons.push("MACD momentum rising"); }
  else if (macdNow < macdPrev) { score -= 5; reasons.push("MACD momentum falling"); }

  if (ema20Now > ema50Now) { score += 15; reasons.push("EMA20 > EMA50 (uptrend)"); }
  else { score -= 15; reasons.push("EMA20 < EMA50 (downtrend)"); }

  if (last <= bbLower) { score += 15; reasons.push("Price at lower BB"); }
  else if (last >= bbUpper) { score -= 15; reasons.push("Price at upper BB"); }
  else if (last < bbMid) { score += 5; }
  else { score -= 5; }

  if (last > prev) { score += 5; }
  else { score -= 5; }

  score = Math.max(-100, Math.min(100, score));

  let direction: "LONG" | "SHORT" | "NEUTRAL" = "NEUTRAL";
  if (score >= 30) direction = "LONG";
  else if (score <= -30) direction = "SHORT";

  return {
    id: `${market.symbol}-${Date.now()}`,
    symbol: market.symbol,
    direction,
    strength: Math.abs(score),
    reasons,
    price: last,
    time: Date.now(),
  };
}
