export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Market = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  candles: Candle[];
  lastUpdate: number;
};

export type Signal = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT" | "NEUTRAL";
  strength: number;
  reasons: string[];
  price: number;
  time: number;
};

export type Trade = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice?: number;
  stake: number;
  pnl?: number;
  status: "OPEN" | "WIN" | "LOSS";
  openedAt: number;
  closedAt?: number;
  durationSec: number;
};

export type Rules = {
  stake: number;
  targetProfit: number;
  stopLoss: number;
  tradeDurationSec: number;
  signalThreshold: number;
  maxOpenTrades: number;
  enabledMarkets: string[];
};

export type Account = {
  username: string;
  mode: "DEMO" | "LIVE";
  balance: number;
  startingBalance: number;
  equityCurve: { time: number; balance: number }[];
};

export type BotState = {
  running: boolean;
  lastTick: number;
  markets: Market[];
  signals: Signal[];
  trades: Trade[];
  account: Account;
  rules: Rules;
};
