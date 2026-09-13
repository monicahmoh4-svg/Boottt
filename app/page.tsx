"use client";
import { useEffect, useState } from "react";
import LoginModal from "@/components/LoginModal";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [session, setSession] = useState<{ username: string; mode: "DEMO" | "LIVE" } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ptb_session_v1");
      if (raw) setSession(JSON.parse(raw));
    } catch {}
  }, []);

  const handleLogin = (username: string, mode: "DEMO" | "LIVE") => {
    const s = { username, mode };
    setSession(s);
    localStorage.setItem("ptb_session_v1", JSON.stringify(s));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("ptb_session_v1");
  };

  if (!session) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return <Dashboard username={session.username} mode={session.mode} onLogout={handleLogout} />;
}
