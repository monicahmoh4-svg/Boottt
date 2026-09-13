"use client";
import type { Market, Signal } from "@/lib/types";

export default function MarketScanner({ markets, signals, lastTick }: { markets: Market[]; signals: Signal[]; lastTick: number }) {
  const latestSignal = new Map(signals.map((s) => [s.symbol, s]));
  const timeSinceScan = lastTick ? Math.floor((Date.now() - lastTick) / 1000) : null;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">🔍 Market Scanner</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-brand-accent" />
          <span className="text-gray-400">
            {timeSinceScan !== null ? `Updated ${timeSinceScan}s ago` : "Waiting..."}
          </span>
        </div>
      </div>
      
      {markets.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-2 text-2xl">📡</div>
          <div className="text-sm text-gray-500">Scanning markets...</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {markets.map((m) => {
            const sig = latestSignal.get(m.symbol);
            const positive = m.change24h >= 0;
            return (
              <div key={m.symbol} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-bg p-3 transition hover:border-gray-600">
                <div className="flex-1">
                  <div className="font-semibold text-white">{m.symbol.replace("USDT", "")}</div>
                  <div className="text-xs text-gray-500">{m.name}</div>
                </div>
                <div className="text-right mx-3">
                  <div className="font-mono text-sm text-white">
                    ${m.price.toFixed(m.price < 1 ? 5 : 2)}
                  </div>
                  <div className={`text-xs font-medium ${positive ? "text-brand-accent" : "text-brand-danger"}`}>
                    {positive ? "+" : ""}{m.change24h.toFixed(2)}%
                  </div>
                </div>
                {sig && (
                  <div className={`rounded px-2 py-1 text-xs font-bold min-w-[70px] text-center ${
                    sig.direction === "LONG" ? "bg-brand-accent/20 text-brand-accent" :
                    sig.direction === "SHORT" ? "bg-brand-danger/20 text-brand-danger" :
                    "bg-gray-700 text-gray-400"
                  }`}>
                    {sig.direction === "NEUTRAL" ? "—" : `${sig.direction} ${sig.strength}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
