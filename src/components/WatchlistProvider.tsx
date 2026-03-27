"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WatchlistContextType {
  watchlist: string[];
  toggle: (symbol: string) => void;
  isWatched: (symbol: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  toggle: () => {},
  isWatched: () => false,
});

export function useWatchlist() {
  return useContext(WatchlistContext);
}

const STORAGE_KEY = "stock-screener-watchlist";

export default function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWatchlist(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, loaded]);

  function toggle(symbol: string) {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }

  function isWatched(symbol: string) {
    return watchlist.includes(symbol);
  }

  return (
    <WatchlistContext.Provider value={{ watchlist, toggle, isWatched }}>
      {children}
    </WatchlistContext.Provider>
  );
}
