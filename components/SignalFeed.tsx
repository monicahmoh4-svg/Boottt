"use client";
import type { Signal } from "@/lib/types";

export default function SignalFeed({ signals }: { signals: Signal[] }) {
  const recent = signals.slice(-20).reverse();

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <h3 className="mb-4 text-lg font-semibold">📡 Live Signals</h3>
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {recent.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            Waiting for signals...
          </div>
        )}
        {recent.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-brand-border bg-brand-bg p-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{s.symbol.replace("USDT", "")}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    s.direction === "LONG"
                      ? "bg-brand-accent/20 text-brand-accent"
                      : s.direction === "SHORT"
                      ? "bg-brand-danger/20 text-brand-danger"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {s.direction}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Strength</div>
                <div className={`text-sm font-bold ${
                  s.strength >= 70 ? "text-brand-accent" :
                  s.strength >= 50 ? "text-brand-warn" : "text-gray-400"
                }`}>
                  {s.strength}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              @ ${s.price.toFixed(s.price < 1 ? 5 : 2)}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {s.reasons.slice(0, 3).map((r, i) => (
                <span key={i} className="rounded bg-brand-border/50 px-1.5 py-0.5 text-[10px] text-gray-300">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
