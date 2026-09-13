"use client";
import type { Rules } from "@/lib/types";
import { WATCHLIST } from "@/lib/market";

type Props = {
  rules: Rules;
  onChange: (r: Rules) => void;
};

export default function RulesPanel({ rules, onChange }: Props) {
  const update = <K extends keyof Rules>(k: K, v: Rules[K]) =>
    onChange({ ...rules, [k]: v });

  const toggleMarket = (sym: string) => {
    const set = new Set(rules.enabledMarkets);
    if (set.has(sym)) set.delete(sym); else set.add(sym);
    update("enabledMarkets", Array.from(set));
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <h3 className="mb-4 text-lg font-semibold">⚙️ Trading Rules</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stake ($)" value={rules.stake} onChange={(v) => update("stake", v)} min={1} />
        <Field label="Duration (sec)" value={rules.tradeDurationSec} onChange={(v) => update("tradeDurationSec", v)} min={10} step={10} />
        <Field label="Target Profit ($)" value={rules.targetProfit} onChange={(v) => update("targetProfit", v)} min={1} />
        <Field label="Stop Loss ($)" value={rules.stopLoss} onChange={(v) => update("stopLoss", v)} min={1} />
        <Field label="Signal Threshold" value={rules.signalThreshold} onChange={(v) => update("signalThreshold", v)} min={0} max={100} />
        <Field label="Max Open Trades" value={rules.maxOpenTrades} onChange={(v) => update("maxOpenTrades", v)} min={1} max={10} />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-sm text-gray-400">Enabled Markets</div>
        <div className="flex flex-wrap gap-2">
          {WATCHLIST.map((w) => {
            const active = rules.enabledMarkets.includes(w.symbol);
            return (
              <button
                key={w.symbol}
                onClick={() => toggleMarket(w.symbol)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : "border-brand-border text-gray-500 hover:border-gray-600"
                }`}
              >
                {w.symbol.replace("USDT", "")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, min, max, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
      />
    </div>
  );
}
