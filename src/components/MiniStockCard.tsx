import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { Stock } from "@/lib/stockData";

interface Props {
  stock: Stock;
}

export default function MiniStockCard({ stock }: Props) {
  const isUp = stock.change >= 0;
  return (
    <Link
      href={`/stock/${stock.symbol}`}
      className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
    >
      <div>
        <span className="font-bold text-emerald-400 text-sm">{stock.symbol}</span>
        <p className="text-xs text-slate-400 truncate max-w-[140px]">{stock.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{formatCurrency(stock.price)}</p>
        <p className={`text-xs font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
          {formatPercent(stock.changePercent)}
        </p>
      </div>
    </Link>
  );
}
