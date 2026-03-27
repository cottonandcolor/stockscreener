import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatLargeNumber, formatVolume } from "@/lib/formatters";
import type { InsiderTrade } from "@/lib/stockData";

interface Props {
  trades: InsiderTrade[];
  showSymbol?: boolean;
}

export default function InsiderTrades({ trades, showSymbol = true }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
            {showSymbol && <th className="text-left px-3 py-2.5">Stock</th>}
            <th className="text-left px-3 py-2.5">Insider</th>
            <th className="text-left px-3 py-2.5">Title</th>
            <th className="text-center px-3 py-2.5">Type</th>
            <th className="text-right px-3 py-2.5">Shares</th>
            <th className="text-right px-3 py-2.5">Price</th>
            <th className="text-right px-3 py-2.5">Value</th>
            <th className="text-right px-3 py-2.5">Date</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const isBuy = trade.tradeType === "Buy";
            return (
              <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                {showSymbol && (
                  <td className="px-3 py-2.5">
                    <Link href={`/stock/${trade.symbol}`} className="font-bold text-emerald-400 hover:underline">
                      {trade.symbol}
                    </Link>
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{trade.companyName}</p>
                  </td>
                )}
                <td className="px-3 py-2.5 text-slate-200 font-medium whitespace-nowrap">{trade.insiderName}</td>
                <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{trade.title}</td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isBuy
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trade.tradeType}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">
                  {trade.shares.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">
                  {formatCurrency(trade.pricePerShare)}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white">
                  {formatLargeNumber(trade.totalValue)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-400 whitespace-nowrap tabular-nums">
                  {new Date(trade.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
