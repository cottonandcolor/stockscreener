"use client";

import { useEffect, useState } from "react";
import { DollarSign, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatLargeNumber } from "@/lib/formatters";

interface InsiderBuyUnder10 {
  id: number;
  symbol: string;
  companyName: string;
  insiderName: string;
  title: string;
  tradeType: string;
  shares: number;
  pricePerShare: number;
  totalValue: number;
  date: string;
  sharesOwned: number;
  currentPrice: number;
}

export default function DashboardInsiderBuys() {
  const [trades, setTrades] = useState<InsiderBuyUnder10[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insider-buys")
      .then((r) => r.json())
      .then((data) => setTrades(data.trades ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-white">Top 10 Insider Buys — Stocks Under $10</h2>
        <span className="text-xs text-slate-500 ml-auto">Source: SEC EDGAR Form 4</span>
      </div>
      <p className="text-xs text-slate-500 mb-4 ml-7">
        Largest insider purchases in stocks currently priced below $10
      </p>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Scanning sub-$10 stocks for insider buys...</span>
        </div>
      ) : trades.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No insider buys found for stocks under $10.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2.5">Stock</th>
                <th className="text-right px-3 py-2.5">Price</th>
                <th className="text-left px-3 py-2.5">Insider</th>
                <th className="text-left px-3 py-2.5">Title</th>
                <th className="text-right px-3 py-2.5">Shares</th>
                <th className="text-right px-3 py-2.5">Buy Price</th>
                <th className="text-right px-3 py-2.5">Value</th>
                <th className="text-right px-3 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 py-2.5">
                    <Link href={`/stock/${t.symbol}`} className="font-bold text-emerald-400 hover:underline">
                      {t.symbol}
                    </Link>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{t.companyName}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400">
                      {formatCurrency(t.currentPrice)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{t.insiderName}</td>
                  <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{t.title}</td>
                  <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">{t.shares.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">{formatCurrency(t.pricePerShare)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      {formatLargeNumber(t.totalValue)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-400 whitespace-nowrap tabular-nums">
                    {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
