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
        console.log("[Bot] Scanning markets...");
        const markets = await fetchAllMarkets();
        console.log(`[Bot] Fetched ${markets.length} markets`);
        
        const newSignals: Signal[] = markets.map((m) => analyze(m));
        console.log(`[Bot] Generated ${newSignals.length} signals`);

        setState((prev) => {
          let next: BotState = {
            ...prev,
            markets,
            signals: [...prev.signals, ...newSignals].slice(-500),
            lastTick: Date.now(),
          };

          // Close expired trades
          const now = Date.now();
          const tradesToClose: Trade[] = [];
          const stillOpen: Trade[] = [];
          for (const t of next.trades) {
            if (t.status === "OPEN" && now - t.openedAt >= t.durationSec * 1000) {
              const mkt = markets.find((m) => m.symbol === t.symbol);
              if (mkt) {
                const closed = closeTrade(t, mkt.price);
                tradesToClose.push(closed);
                console.log(`[Bot] Closed trade ${t.symbol} ${t.direction}: ${closed.status} (PnL: $${closed.pnl?.toFixed(2)})`);
              } else {
                stillOpen.push(t);
              }
            } else {
              stillOpen.push(t);
            }
          }

          let account = next.account;
          for (const closed of tradesToClose) {
            account = applyTradeToAccount(account, closed);
          }
          next = { ...next, trades: [...stillOpen, ...tradesToClose], account };

          // Check stop conditions
          const stop = checkStopConditions(account, next.rules);
          if (stop !== "OK") {
            console.log(`[Bot] Stop condition triggered: ${stop}`);
            next = { ...next, running: false };
          }

          // Open new trades
          if (next.running) {
            const toOpen: Trade[] = [];
            for (const sig of newSignals) {
              const check = canTrade(next, sig);
              if (check.allowed) {
                const trade = openTrade(next, sig);
                toOpen.push(trade);
                console.log(`[Bot] Opening trade: ${sig.symbol} ${sig.direction} @ $${sig.price.toFixed(2)} (strength: ${sig.strength})`);
                // Update next state to prevent duplicate checks in same tick
                next = { ...next, trades: [...next.trades, trade] };
              } else if (sig.direction !== "NEUTRAL" && sig.strength >= 30) {
                console.log(`[Bot] Skip ${sig.symbol}: ${check.reason}`);
              }
            }
          }

          return next;
        });
      } catch (e) {
        console.error("[Bot] Tick error:", e);
      }
      if (!cancelled) setTimeout(tick, 15_000);
    };
    
    // Initial tick
    tick();
    return () => { cancelled = true; };
  }, []);

  const toggle = () => {
    setState((s) => {
      const newRunning = !s.running;
      console.log(`[Bot] ${newRunning ? "Started" : "Stopped"}`);
      return { ...s, running: newRunning };
    });
  };
  
  const reset = () => {
    if (typeof window !== "undefined" && !confirm("Reset account to $10,000 and clear all trades?")) return;
    console.log("[Bot] Resetting account");
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
                    Running · Scanning every 15s
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
              <MarketScanner 
                markets={state.markets} 
                signals={state.signals}
                lastTick={state.lastTick}
              />
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
