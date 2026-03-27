"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import StockTable from "@/components/StockTable";
import { useWatchlist } from "@/components/WatchlistProvider";
import Link from "next/link";
import type { Stock } from "@/lib/stockData";

export default function WatchlistPage() {
  const { watchlist, toggle } = useWatchlist();
  const [allStocks, setAllStocks] = useState<Stock[]>([]);

  useEffect(() => {
    fetch("/api/stocks")
      .then((r) => r.json())
      .then((data) => setAllStocks(data.stocks));
  }, []);

  const watchedStocks = allStocks.filter((s) => watchlist.includes(s.symbol));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Watchlist</h1>
        </div>
        <p className="text-slate-400">
          Your saved stocks &middot; Stored locally in your browser &middot;{" "}
          <span className="text-emerald-400 font-medium">{watchedStocks.length}</span> stocks
        </p>
      </div>

      {watchedStocks.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No Stocks in Watchlist</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Add stocks to your watchlist by clicking the star icon on the Screener page or on any stock detail page.
          </p>
          <Link
            href="/screener"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            Go to Screener
          </Link>
        </div>
      ) : (
        <StockTable stocks={watchedStocks} watchlist={watchlist} onToggleWatchlist={toggle} />
      )}
    </div>
  );
}
