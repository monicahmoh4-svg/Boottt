"use client";
import type { Account } from "@/lib/types";

export default function BalanceCard({ account }: { account: Account }) {
  const pnl = account.balance - account.startingBalance;
  const pct = (pnl / account.startingBalance) * 100;
  const positive = pnl >= 0;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-gray-400">Balance</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            account.mode === "DEMO"
              ? "bg-blue-500/10 text-blue-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {account.mode}
        </span>
      </div>
      <div className="text-3xl font-bold text-white">
        ${account.balance.toFixed(2)}
      </div>
      <div className={`mt-2 text-sm font-medium ${positive ? "text-brand-accent" : "text-brand-danger"}`}>
        {positive ? "▲" : "▼"} ${Math.abs(pnl).toFixed(2)} ({pct.toFixed(2)}%)
      </div>
      <div className="mt-4 text-xs text-gray-500">
        👤 {account.username}
      </div>
    </div>
  );
}
