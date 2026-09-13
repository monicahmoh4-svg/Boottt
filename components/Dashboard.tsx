"use client";
import { useEffect, useRef, useState } from "react";
import type { BotState, Signal, Trade } from "@/lib/types";
import { fetchAllMarkets } from "@/lib/market";
import { analyze } from "@/lib/signals";
import {
  canTrade, openTrade, closeTrade, applyTradeToAccount,
  checkStopConditions, defaultRules, defaultAccount,
  loadState, saveState,
} from "@/lib/trading-engine";
import BalanceCard from "./BalanceCard";
import RulesPanel from "./RulesPanel";
import SignalFeed from "./SignalFeed";
import TradeLog from "./TradeLog";
import EquityChart from "./EquityChart";
import MarketScanner from "./MarketScanner";
import ControlPanel from "./ControlPanel";

type Props = {
  username: string;
  mode: "DEMO" | "LIVE";
  onLogout: () => void;
};

export default function Dashboard({ username, mode, onLogout }: Props) {
  const [state, setState] = useState<BotState>(() => {
    const saved = loadState();
    if (saved) {
      return { ...saved, account: { ...saved.account, username, mode } };
    }
    return {
      running: false,
      lastTick: 0,
      markets: [],
      signals: [],
      trades: [],
      account: { ...defaultAccount(), username, mode },
      rules: defaultRules(),
    };
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        const markets = await fetchAllMarkets();
        const newSignals: Signal[] = markets.map((m) => analyze(m));

        setState((prev) => {
          let next: BotState = {
            ...prev,
            markets,
            signals: [...prev.signals, ...newSignals].slice(-500),
            lastTick: Date.now(),
          };

          const now = Date.now();
          const tradesToClose: Trade[] = [];
          const stillOpen: Trade[] = [];
          for (const t of next.trades) {
            if (t.status === "OPEN" && now - t.openedAt >= t.durationSec * 1000) {
              const mkt = markets.find((m) => m.symbol === t.symbol);
              if (mkt) tradesToClose.push(closeTrade(t, mkt.price));
              else stillOpen.push(t);
            } else {
              stillOpen.push(t);
            }
          }

          let account = next.account;
          for (const closed of tradesToClose) {
            account = applyTradeToAccount(account, closed);
          }
          next = { ...next, trades: [...stillOpen, ...tradesToClose], account };

          const stop = checkStopConditions(account, next.rules);
          if (stop !== "OK") {
            next = { ...next, running: false };
          }

          if (next.running) {
            const toOpen: Trade[] = [];
            for (const sig of newSignals) {
              if (canTrade(next, sig)) {
                toOpen.push(openTrade(next, sig));
              }
            }
            if (toOpen.length) {
              const existingIds = new Set(next.trades.map((t) => t.id));
              const fresh = toOpen.filter((t) => !existingIds.has(t.id));
              next = { ...next, trades: [...next.trades, ...fresh] };
            }
          }

          return next;
        });
      } catch (e) {
        console.error("tick error", e);
      }
      if (!cancelled) setTimeout(tick, 15_000);
    };
    tick();
    return () => { cancelled = true; };
  }, []);

  const toggle = () => setState((s) => ({ ...s, running: !s.running }));
  const reset = () => {
    if (typeof window !== "undefined" && !confirm("Reset account to $10,000 and clear all trades?")) return;
    setState((s) => ({
      ...s,
      running: false,
      trades: [],
      signals: [],
      account: { ...defaultAccount(), username, mode },
      rules: defaultRules(),
    }));
  };

  const closedTrades = state.trades.filter((t) => t.status !== "OPEN");
  const totalProfit = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-brand-border bg-brand-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <div className="font-bold text-white">Paper Trading Bot</div>
              <div className="text-xs text-gray-400">
                {state.running ? (
                  <span className="flex items-center gap-1 text-brand-accent">
                    <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-brand-accent" />
                    Running
                  </span>
                ) : "Idle"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="text-white">${state.account.balance.toFixed(2)}</div>
              <div className="text-xs text-gray-400">{username} · {mode}</div>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-gray-300 hover:border-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <BalanceCard account={state.account} />
            <ControlPanel
              running={state.running}
              onToggle={toggle}
              onReset={reset}
              stats={{
                trades: closedTrades.length,
                profit: totalProfit,
                signals: state.signals.length,
              }}
            />
            <RulesPanel rules={state.rules} onChange={(r) => setState((s) => ({ ...s, rules: r }))} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <EquityChart account={state.account} />
            <div className="grid gap-6 md:grid-cols-2">
              <MarketScanner markets={state.markets} signals={state.signals} />
              <SignalFeed signals={state.signals} />
            </div>
            <TradeLog trades={state.trades} />
          </div>
        </div>

        <footer className="pb-4 pt-8 text-center text-xs text-gray-600">
          Paper trading only · Data from Binance public API · Not financial advice
        </footer>
      </main>
    </div>
  );
}
