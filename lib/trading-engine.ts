import type { BotState, Rules, Signal, Trade, Account } from "./types";

const DEFAULT_RULES: Rules = {
  stake: 10,
  targetProfit: 100,
  stopLoss: 50,
  tradeDurationSec: 60,
  signalThreshold: 60,
  maxOpenTrades: 3,
  enabledMarkets: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
};

const DEFAULT_ACCOUNT: Account = {
  username: "",
  mode: "DEMO",
  balance: 10000,
  startingBalance: 10000,
  equityCurve: [{ time: Date.now(), balance: 10000 }],
};

export function defaultRules(): Rules { return { ...DEFAULT_RULES }; }
export function defaultAccount(): Account {
  return { ...DEFAULT_ACCOUNT, equityCurve: [...DEFAULT_ACCOUNT.equityCurve] };
}

export function canTrade(state: BotState, signal: Signal): boolean {
  if (!state.running) return false;
  if (signal.direction === "NEUTRAL") return false;
  if (signal.strength < state.rules.signalThreshold) return false;
  if (!state.rules.enabledMarkets.includes(signal.symbol)) return false;
  const openCount = state.trades.filter((t) => t.status === "OPEN").length;
  if (openCount >= state.rules.maxOpenTrades) return false;
  if (state.account.balance < state.rules.stake) return false;
  const alreadyOpen = state.trades.some(
    (t) => t.symbol === signal.symbol && t.status === "OPEN"
  );
  if (alreadyOpen) return false;
  return true;
}

export function openTrade(state: BotState, signal: Signal): Trade {
  return {
    id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    symbol: signal.symbol,
    direction: signal.direction as "LONG" | "SHORT",
    entryPrice: signal.price,
    stake: state.rules.stake,
    status: "OPEN",
    openedAt: Date.now(),
    durationSec: state.rules.tradeDurationSec,
  };
}

const WIN_PAYOUT = 0.85;

export function closeTrade(trade: Trade, currentPrice: number): Trade {
  const won =
    (trade.direction === "LONG" && currentPrice > trade.entryPrice) ||
    (trade.direction === "SHORT" && currentPrice < trade.entryPrice);
  const pnl = won ? trade.stake * WIN_PAYOUT : -trade.stake;
  return {
    ...trade,
    exitPrice: currentPrice,
    status: won ? "WIN" : "LOSS",
    pnl,
    closedAt: Date.now(),
  };
}

export function applyTradeToAccount(account: Account, trade: Trade): Account {
  const newBalance = account.balance + (trade.pnl || 0);
  return {
    ...account,
    balance: newBalance,
    equityCurve: [
      ...account.equityCurve,
      { time: trade.closedAt || Date.now(), balance: newBalance },
    ],
  };
}

export function checkStopConditions(account: Account, rules: Rules): "OK" | "TARGET" | "STOP" {
  const totalPnl = account.balance - account.startingBalance;
  if (totalPnl >= rules.targetProfit) return "TARGET";
  if (totalPnl <= -rules.stopLoss) return "STOP";
  return "OK";
}

export function loadState(): BotState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ptb_state_v1");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state: BotState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ptb_state_v1", JSON.stringify(state));
  } catch {}
}
