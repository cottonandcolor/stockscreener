"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import StockTable from "@/components/StockTable";
import { useWatchlist } from "@/components/WatchlistProvider";
import type { Stock } from "@/lib/stockData";

interface Filters {
  search: string;
  sector: string;
  industry: string;
  minPrice: string;
  maxPrice: string;
  minMarketCap: string;
  maxPE: string;
  minDividend: string;
  minVolume: string;
}

const MARKET_CAP_OPTIONS = [
  { label: "Any", value: "" },
  { label: "> $1T (Mega)", value: "1000000000000" },
  { label: "> $200B (Large)", value: "200000000000" },
  { label: "> $10B (Mid)", value: "10000000000" },
  { label: "> $2B (Small)", value: "2000000000" },
];

const DEFAULT_FILTERS: Filters = {
  search: "",
  sector: "",
  industry: "",
  minPrice: "",
  maxPrice: "",
  minMarketCap: "",
  maxPE: "",
  minDividend: "",
  minVolume: "",
};

export default function ScreenerPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-700 rounded mx-auto mb-4" />
          <div className="h-4 w-64 bg-slate-700 rounded mx-auto" />
        </div>
      </div>
    }>
      <ScreenerContent />
    </Suspense>
  );
}

function ScreenerContent() {
  const searchParams = useSearchParams();
  const { watchlist, toggle } = useWatchlist();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [industries, setIndustries] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    sector: searchParams.get("sector") || "",
  }));

  useEffect(() => {
    fetch("/api/stocks")
      .then((r) => r.json())
      .then((data) => {
        setStocks(data.stocks);
        setSectors(data.sectors);
        setIndustries(data.industries);
      });
  }, []);

  const updateFilter = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "sector") next.industry = "";
        return next;
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!s.symbol.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) return false;
      }
      if (filters.sector && s.sector !== filters.sector) return false;
      if (filters.industry && s.industry !== filters.industry) return false;
      if (filters.minPrice && s.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && s.price > Number(filters.maxPrice)) return false;
      if (filters.minMarketCap && s.marketCap < Number(filters.minMarketCap)) return false;
      if (filters.maxPE && s.pe > Number(filters.maxPE)) return false;
      if (filters.minDividend && s.dividend < Number(filters.minDividend)) return false;
      if (filters.minVolume && s.volume < Number(filters.minVolume) * 1e6) return false;
      return true;
    });
  }, [stocks, filters]);

  const hasActiveFilters = Object.entries(filters).some(
    ([key, val]) => val !== "" && key !== "search"
  );

  const availableIndustries = filters.sector ? industries[filters.sector] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Stock Screener</h1>
          <p className="text-slate-400">
            Filter and find stocks by criteria &middot;{" "}
            <span className="text-emerald-400 font-medium">{filteredStocks.length}</span> results
          </p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by symbol or company name..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FilterSelect
              label="Sector"
              value={filters.sector}
              onChange={(v) => updateFilter("sector", v)}
              options={[{ label: "All Sectors", value: "" }, ...sectors.map((s) => ({ label: s, value: s }))]}
            />
            <FilterSelect
              label="Industry"
              value={filters.industry}
              onChange={(v) => updateFilter("industry", v)}
              options={[
                { label: "All Industries", value: "" },
                ...availableIndustries.map((i) => ({ label: i, value: i })),
              ]}
              disabled={!filters.sector}
            />
            <FilterSelect
              label="Market Cap"
              value={filters.minMarketCap}
              onChange={(v) => updateFilter("minMarketCap", v)}
              options={MARKET_CAP_OPTIONS}
            />
            <FilterInput
              label="Max P/E Ratio"
              value={filters.maxPE}
              onChange={(v) => updateFilter("maxPE", v)}
              placeholder="e.g. 30"
            />
            <FilterInput
              label="Min Price ($)"
              value={filters.minPrice}
              onChange={(v) => updateFilter("minPrice", v)}
              placeholder="e.g. 10"
            />
            <FilterInput
              label="Max Price ($)"
              value={filters.maxPrice}
              onChange={(v) => updateFilter("maxPrice", v)}
              placeholder="e.g. 500"
            />
            <FilterInput
              label="Min Dividend (%)"
              value={filters.minDividend}
              onChange={(v) => updateFilter("minDividend", v)}
              placeholder="e.g. 1.5"
            />
            <FilterInput
              label="Min Volume (M)"
              value={filters.minVolume}
              onChange={(v) => updateFilter("minVolume", v)}
              placeholder="e.g. 10"
            />
          </div>
        </div>
      )}

      {/* Results */}
      <StockTable stocks={filteredStocks} watchlist={watchlist} onToggleWatchlist={toggle} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
