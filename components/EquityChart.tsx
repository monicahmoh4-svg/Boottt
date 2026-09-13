"use client";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { Account } from "@/lib/types";

export default function EquityChart({ account }: { account: Account }) {
  const data = account.equityCurve.map((p) => ({
    time: new Date(p.time).toLocaleTimeString(),
    balance: p.balance,
  }));

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel p-6">
      <h3 className="mb-4 text-lg font-semibold">📈 Equity Curve</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
            <YAxis stroke="#6b7280" fontSize={10} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8 }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
