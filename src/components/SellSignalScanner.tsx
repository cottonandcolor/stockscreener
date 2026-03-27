"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Loader2, TrendingDown, Volume2, Target, Skull } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface SellSignal {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  ma50: number;
  ma200: number;
  high52: number;
  low52: number;
  signals: string[];
  strength: number;
}

const SIGNAL_ICONS: Record<string, { icon: typeof TrendingDown; color: string }> = {
  "Death Cross": { icon: Skull, color: "text-red-500" },
  "Below 50-Day MA": { icon: TrendingDown, color: "text-red-400" },
  "Below 200-Day MA": { icon: TrendingDown, color: "text-red-500" },
  "Heavy Selloff": { icon: Volume2, color: "text-orange-400" },
  "Near 52W Low": { icon: Target, color: "text-amber-400" },
  "Down 20%+ from High": { icon: ShieldAlert, color: "text-rose-400" },
};

export default function SellSignalScanner() {
  const [signals, setSignals] = useState<SellSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sell-signals")
      .then((r) => r.json())
      .then((data) => setSignals(data.signals ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-red-900/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Sell Signal Scanner</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Scanning for sell signals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-red-900/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Sell Signal Scanner</h2>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-semibold">
          {signals.length} active
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4 ml-7">
        Stocks with multiple bearish technical signals (Death Cross, MA breakdowns, heavy selloffs, 52W lows)
      </p>

      {signals.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No sell signals detected.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2.5">Stock</th>
                <th className="text-right px-3 py-2.5">Price</th>
                <th className="text-right px-3 py-2.5">Change</th>
                <th className="text-right px-3 py-2.5">50D MA</th>
                <th className="text-right px-3 py-2.5">200D MA</th>
                <th className="text-right px-3 py-2.5">Vol Ratio</th>
                <th className="text-left px-3 py-2.5">Signals</th>
                <th className="text-center px-3 py-2.5">Risk</th>
              </tr>
            </thead>
            <tbody>
              {signals.slice(0, 15).map((s) => {
                const volRatio = s.avgVolume > 0 ? s.volume / s.avgVolume : 1;
                return (
                  <tr key={s.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <Link href={`/stock/${s.symbol}`} className="font-bold text-red-400 hover:underline">
                        {s.symbol}
                      </Link>
                      <p className="text-xs text-slate-500 truncate max-w-[120px]">{s.name}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums font-medium">
                      {formatCurrency(s.price)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <span className={s.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {formatPercent(s.changePercent)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-300 tabular-nums">
                      {formatCurrency(s.ma50)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-300 tabular-nums">
                      {formatCurrency(s.ma200)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <span className={`font-medium ${volRatio >= 1.5 ? "text-orange-400" : "text-slate-400"}`}>
                        {volRatio.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {s.signals.map((sig) => {
                          const meta = SIGNAL_ICONS[sig];
                          return (
                            <span
                              key={sig}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-900/30 text-red-300"
                              title={sig}
                            >
                              {meta && <meta.icon className={`w-2.5 h-2.5 ${meta.color}`} />}
                              {sig}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < s.strength ? "bg-red-400" : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
