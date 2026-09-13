import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper Trading Bot",
  description: "AI-driven paper trading simulator with real market data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
