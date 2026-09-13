"use client";
import type { Trade } from "@/lib/types";

export default function TradeLog({ trades }: { trades: Trade[] }) {
  const recent = trades.slice(-30).reverse();
  const open = trades.filter((t) => t.status === "OPEN").length;
  const wins = trades.filter((t) => t.status === "WIN").length;
  const losses = trades.filter((t) => t.status === "LOSS").length;
  const winRate = trades.length > 0 ? ((wins / (wins + losses)) * 100) || 0 : 0;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">📋 Trade Log</h3>
        <div className="flex gap-3 text-xs">
          <span className="text-gray-400">Open: <span className="font-bold text-white">{open}</span></span>
          <span className="text-gray-400">Wins: <span className="font-bold text-brand-accent">{wins}</span></span>
          <span className="text-gray-400">Losses: <span className="font-bold text-brand-danger">{losses}</span></span>
          <span className="text-gray-400">Rate: <span className="font-bold text-white">{winRate.toFixed(1)}%</span></span>
        </div>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {recent.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">No trades yet</div>
        )}
        {recent.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-bg p-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${
                t.status === "OPEN" ? "bg-brand-warn animate-pulse" :
                t.status === "WIN" ? "bg-brand-accent" : "bg-brand-danger"
              }`} />
              <div>
                <div className="font-medium text-white">
                  {t.symbol.replace("USDT", "")} · {t.direction}
                </div>
                <div className="text-xs text-gray-500">
                  @ ${t.entryPrice.toFixed(t.entryPrice < 1 ? 5 : 2)}
                </div>
              </div>
            </div>
            <div className="text-right">
              {t.status === "OPEN" ? (
                <span className="text-xs text-brand-warn">OPEN</span>
              ) : (
                <>
                  <div className={`font-bold ${t.pnl! >= 0 ? "text-brand-accent" : "text-brand-danger"}`}>
                    {t.pnl! >= 0 ? "+" : ""}${t.pnl!.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{t.status}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
