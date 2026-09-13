"use client";
import { useState } from "react";

export default function LoginModal({ onLogin }: { onLogin: (username: string, mode: "DEMO" | "LIVE") => void }) {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"DEMO" | "LIVE">("DEMO");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-panel p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/20 text-brand-accent">
            🤖
          </div>
          <h1 className="text-2xl font-bold">Paper Trading Bot</h1>
          <p className="mt-1 text-sm text-gray-400">Connect to start scanning markets</p>
        </div>

        <label className="mb-1 block text-sm text-gray-400">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="trader_01"
          className="mb-4 w-full rounded-lg border border-brand-border bg-brand-bg px-4 py-3 text-white outline-none focus:border-brand-accent"
        />

        <label className="mb-1 block text-sm text-gray-400">Account Mode</label>
        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("DEMO")}
            className={`rounded-lg border px-4 py-3 font-medium transition ${
              mode === "DEMO"
                ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                : "border-brand-border text-gray-400 hover:border-gray-600"
            }`}
          >
            🎮 Demo ($10,000)
          </button>
          <button
            onClick={() => setMode("LIVE")}
            className={`rounded-lg border px-4 py-3 font-medium transition ${
              mode === "LIVE"
                ? "border-brand-warn bg-brand-warn/10 text-brand-warn"
                : "border-brand-border text-gray-400 hover:border-gray-600"
            }`}
          >
            ⚡ Live (Paper)
          </button>
        </div>

        <button
          disabled={username.trim().length < 2}
          onClick={() => onLogin(username.trim(), mode)}
          className="w-full rounded-lg bg-brand-accent px-4 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Connect & Start
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          All trading is simulated. No real funds are used.
        </p>
      </div>
    </div>
  );
}
