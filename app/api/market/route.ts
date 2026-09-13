import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "1m";
  const limit = searchParams.get("limit") || "100";

  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error("binance fetch failed");
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
