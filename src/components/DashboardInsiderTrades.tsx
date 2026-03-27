"use client";

import { useEffect, useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import InsiderTrades from "./InsiderTrades";
import type { InsiderTrade } from "@/lib/stockData";

export default function DashboardInsiderTrades() {
  const [trades, setTrades] = useState<InsiderTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insider-trades")
      .then((r) => r.json())
      .then((data) => setTrades(data.trades ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Top 10 Insider Trades</h2>
        <span className="text-xs text-slate-500 ml-auto">Source: SEC EDGAR Form 4</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading insider trades from SEC EDGAR...</span>
        </div>
      ) : trades.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No insider trades found.</p>
      ) : (
        <InsiderTrades trades={trades} />
      )}
    </div>
  );
}
