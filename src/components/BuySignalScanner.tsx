"use client";

import { useEffect, useState } from "react";
import { Crosshair, Loader2, TrendingUp, Volume2, Target, Star } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatPercent, formatVolume } from "@/lib/formatters";

interface BuySignal {
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

const SIGNAL_ICONS: Record<string, { icon: typeof TrendingUp; color: string }> = {
  "Golden Cross": { icon: Star, color: "text-yellow-400" },
  "Above 50-Day MA": { icon: TrendingUp, color: "text-emerald-400" },
  "Above 200-Day MA": { icon: TrendingUp, color: "text-emerald-500" },
  "Volume Surge": { icon: Volume2, color: "text-blue-400" },
  "52W Low Bounce": { icon: TrendingUp, color: "text-cyan-400" },
  "Near 52W High": { icon: Target, color: "text-purple-400" },
};

export default function BuySignalScanner() {
  const [signals, setSignals] = useState<BuySignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/buy-signals")
      .then((r) => r.json())
      .then((data) => setSignals(data.signals ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Crosshair className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Buy Signal Scanner</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Scanning for buy signals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Crosshair className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Buy Signal Scanner</h2>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
          {signals.length} active
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4 ml-7">
        Stocks with multiple bullish technical signals (MA crossovers, volume surges, 52W proximity)
      </p>

      {signals.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No buy signals detected.</p>
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
                <th className="text-center px-3 py-2.5">Score</th>
              </tr>
            </thead>
            <tbody>
              {signals.slice(0, 15).map((s) => {
                const volRatio = s.avgVolume > 0 ? (s.volume / s.avgVolume) : 1;
                return (
                  <tr key={s.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <Link href={`/stock/${s.symbol}`} className="font-bold text-emerald-400 hover:underline">
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
                      <span className={`font-medium ${volRatio >= 1.5 ? "text-blue-400" : "text-slate-400"}`}>
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
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/80 text-slate-300"
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
                              i < s.strength ? "bg-emerald-400" : "bg-slate-700"
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
