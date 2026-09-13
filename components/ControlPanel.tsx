"use client";

type Props = {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  stats: { trades: number; profit: number; signals: number };
};

export default function ControlPanel({ running, onToggle, onReset, stats }: Props) {
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <h3 className="mb-4 text-lg font-semibold">🎮 Bot Control</h3>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Trades" value={stats.trades.toString()} />
        <Stat
          label="Profit"
          value={`$${stats.profit.toFixed(2)}`}
          color={stats.profit >= 0 ? "text-brand-accent" : "text-brand-danger"}
        />
        <Stat label="Signals" value={stats.signals.toString()} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className={`flex-1 rounded-lg px-4 py-3 font-semibold transition ${
            running
              ? "bg-brand-danger text-white hover:bg-red-600"
              : "bg-brand-accent text-black hover:bg-emerald-400"
          }`}
        >
          {running ? "⏸ Stop Bot" : "▶ Start Bot"}
        </button>
        <button
          onClick={onReset}
          className="rounded-lg border border-brand-border px-4 py-3 font-semibold text-gray-300 transition hover:border-gray-600"
        >
          ↺ Reset
        </button>
      </div>

      {running && (
        <div className="mt-3 flex items-center gap-2 text-xs text-brand-accent">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-brand-accent" />
          Bot is running — scanning & trading
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-bg p-3 text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}
