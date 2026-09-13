"use client";
import type { Market, Signal } from "@/lib/types";

export default function MarketScanner({ markets, signals }: { markets: Market[]; signals: Signal[] }) {
  const latestSignal = new Map(signals.map((s) => [s.symbol, s]));

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">🔍 Market Scanner</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-brand-accent" />
          Live
        </div>
      </div>
      <div className="space-y-2">
        {markets.map((m) => {
          const sig = latestSignal.get(m.symbol);
          const positive = m.change24h >= 0;
          return (
            <div key={m.symbol} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-bg p-3">
              <div>
                <div className="font-semibold text-white">{m.symbol.replace("USDT", "")}</div>
                <div className="text-xs text-gray-500">{m.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-white">
                  ${m.price.toFixed(m.price < 1 ? 5 : 2)}
                </div>
                <div className={`text-xs font-medium ${positive ? "text-brand-accent" : "text-brand-danger"}`}>
                  {positive ? "+" : ""}{m.change24h.toFixed(2)}%
                </div>
              </div>
              {sig && (
                <div className={`ml-3 rounded px-2 py-1 text-xs font-bold ${
                  sig.direction === "LONG" ? "bg-brand-accent/20 text-brand-accent" :
                  sig.direction === "SHORT" ? "bg-brand-danger/20 text-brand-danger" :
                  "bg-gray-700 text-gray-400"
                }`}>
                  {sig.direction} {sig.strength}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
