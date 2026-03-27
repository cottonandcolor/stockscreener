"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Star } from "lucide-react";
import { formatCurrency, formatLargeNumber, formatVolume, formatPercent } from "@/lib/formatters";
import type { Stock } from "@/lib/stockData";

type SortKey = keyof Stock;
type SortDir = "asc" | "desc";

interface Props {
  stocks: Stock[];
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
}

export default function StockTable({ stocks, watchlist = [], onToggleWatchlist }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...stocks].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortDir === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  }

  const columns: { key: SortKey; label: string; align?: "right"; format?: (s: Stock) => string }[] = [
    { key: "symbol", label: "Symbol" },
    { key: "name", label: "Name" },
    { key: "price", label: "Price", align: "right", format: (s) => formatCurrency(s.price) },
    {
      key: "changePercent",
      label: "Change",
      align: "right",
      format: (s) => `${formatCurrency(s.change)} (${formatPercent(s.changePercent)})`,
    },
    { key: "marketCap", label: "Market Cap", align: "right", format: (s) => formatLargeNumber(s.marketCap) },
    { key: "pe", label: "P/E", align: "right", format: (s) => s.pe.toFixed(2) },
    { key: "volume", label: "Volume", align: "right", format: (s) => formatVolume(s.volume) },
    { key: "dividend", label: "Div %", align: "right", format: (s) => `${s.dividend}%` },
    { key: "sector", label: "Sector" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            {onToggleWatchlist && <th className="px-3 py-3 w-10" />}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`px-3 py-3 font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon col={col.key} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((stock) => (
            <tr key={stock.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
              {onToggleWatchlist && (
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onToggleWatchlist(stock.symbol)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        watchlist.includes(stock.symbol)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-500"
                      }`}
                    />
                  </button>
                </td>
              )}
              {columns.map((col) => {
                const isSymbol = col.key === "symbol";
                const isChange = col.key === "changePercent";
                const value = col.format ? col.format(stock) : String(stock[col.key]);
                const changeColor = stock.change > 0 ? "text-emerald-400" : stock.change < 0 ? "text-red-400" : "text-slate-300";

                return (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"} ${
                      isChange ? changeColor : isSymbol ? "font-bold text-emerald-400" : "text-slate-200"
                    }`}
                  >
                    {isSymbol ? (
                      <Link href={`/stock/${stock.symbol}`} className="hover:underline">
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-400">
                No stocks found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
