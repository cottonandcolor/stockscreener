import YahooFinance from "yahoo-finance2";
import { cacheGet, cacheSet, TTL } from "./cache";
import type { Stock, StockDetail } from "./stockData";
import { STOCK_DEFS } from "./stockData";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const SYMBOLS = STOCK_DEFS.map((d) => d.symbol);
const DEF_MAP = new Map(STOCK_DEFS.map((d) => [d.symbol, d]));

function safeNum(val: unknown, fallback = 0): number {
  return typeof val === "number" && isFinite(val) ? val : fallback;
}

export async function fetchAllQuotes(): Promise<Stock[]> {
  const cacheKey = "yahoo:all-quotes";
  const cached = cacheGet<Stock[]>(cacheKey);
  if (cached) return cached;

  const raw = await yf.quote(SYMBOLS, {}, { validateResult: false });
  const quotes = Array.isArray(raw) ? raw : [raw];

  const stocks: Stock[] = quotes
    .map((q: Record<string, unknown>) => {
      const sym = String(q.symbol ?? "");
      const def = DEF_MAP.get(sym);
      if (!def) return null;

      return {
        symbol: sym,
        name: String(q.longName ?? q.shortName ?? def.name),
        sector: def.sector,
        industry: def.industry,
        price: safeNum(q.regularMarketPrice),
        change: safeNum(q.regularMarketChange),
        changePercent: safeNum(q.regularMarketChangePercent),
        marketCap: safeNum(q.marketCap),
        pe: safeNum(q.trailingPE),
        eps: safeNum(q.epsTrailingTwelveMonths),
        dividend: +(safeNum(q.trailingAnnualDividendYield) * 100).toFixed(2),
        volume: safeNum(q.regularMarketVolume),
        avgVolume: safeNum(q.averageDailyVolume3Month),
        high52: safeNum(q.fiftyTwoWeekHigh),
        low52: safeNum(q.fiftyTwoWeekLow),
        beta: 0,
        revenue: 0,
        profit: 0,
        debtToEquity: 0,
        roe: 0,
      } as Stock;
    })
    .filter(Boolean) as Stock[];

  cacheSet(cacheKey, stocks, TTL.QUOTES);
  return stocks;
}

export async function fetchStockDetail(symbol: string): Promise<StockDetail | null> {
  const cacheKey = `yahoo:detail:${symbol}`;
  const cached = cacheGet<StockDetail>(cacheKey);
  if (cached) return cached;

  const def = DEF_MAP.get(symbol.toUpperCase());
  if (!def) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [rawSummary, history, rawFinancials] = await Promise.all([
    yf.quoteSummary(symbol, {
      modules: ["price", "summaryDetail", "defaultKeyStatistics", "financialData", "assetProfile"],
    }) as Promise<any>,
    yf.chart(symbol, { period1: oneYearAgo, period2: today, interval: "1d" }),
    yf.fundamentalsTimeSeries(symbol, {
      period1: twoYearsAgo,
      period2: today,
      type: "quarterly",
      module: "financials",
    }).catch(() => []),
  ]);

  const summary = rawSummary as Record<string, any>;
  const price = summary.price ?? {};
  const sd = summary.summaryDetail ?? {};
  const ks = summary.defaultKeyStatistics ?? {};
  const fd = summary.financialData ?? {};
  const ap = summary.assetProfile ?? {};

  const chartQuotes = ((history as any)?.quotes ?? []) as any[];
  const historicalPrices = chartQuotes.map((h) => ({
    date: h.date instanceof Date ? h.date.toISOString().split("T")[0] : String(h.date),
    open: safeNum(h.open),
    high: safeNum(h.high),
    low: safeNum(h.low),
    close: safeNum(h.close ?? h.adjClose),
    volume: safeNum(h.volume),
  }));

  const financials = (rawFinancials as any[])
    .filter((q) => q.totalRevenue)
    .slice(-8)
    .map((q) => {
      const rev = safeNum(q.totalRevenue);
      const ni = safeNum(q.netIncome);
      const epsVal = safeNum(q.dilutedEPS) || safeNum(q.basicEPS);
      const d = q.date instanceof Date ? q.date : new Date(String(q.date ?? Date.now()));
      const qtr = `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
      return { quarter: qtr, revenue: rev, profit: ni, eps: epsVal };
    });

  const officers = Array.isArray(ap.companyOfficers) ? ap.companyOfficers : [];
  const ceo = (officers as any[]).find((o) =>
    String(o.title ?? "").toLowerCase().includes("ceo") ||
    String(o.title ?? "").toLowerCase().includes("chief executive")
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const detail: StockDetail = {
    symbol: symbol.toUpperCase(),
    name: String(price.longName ?? price.shortName ?? def.name),
    sector: String(ap.sector ?? def.sector),
    industry: String(ap.industry ?? def.industry),
    price: safeNum(price.regularMarketPrice),
    change: safeNum(price.regularMarketChange),
    changePercent: safeNum(price.regularMarketChangePercent),
    marketCap: safeNum(price.marketCap ?? sd.marketCap),
    pe: safeNum(sd.trailingPE),
    eps: safeNum(ks.trailingEps),
    dividend: +(safeNum(sd.dividendYield) * 100).toFixed(2),
    volume: safeNum(price.regularMarketVolume),
    avgVolume: safeNum(sd.averageVolume),
    high52: safeNum(sd.fiftyTwoWeekHigh),
    low52: safeNum(sd.fiftyTwoWeekLow),
    beta: safeNum(ks.beta),
    revenue: safeNum(fd.totalRevenue),
    profit: safeNum(fd.totalRevenue) * safeNum(fd.profitMargins),
    debtToEquity: +(safeNum(fd.debtToEquity) / 100).toFixed(2),
    roe: +(safeNum(fd.returnOnEquity) * 100).toFixed(2),
    description: String(ap.longBusinessSummary ?? `${def.name} operates in the ${ap.industry ?? def.industry} industry.`),
    exchange: String(price.exchangeName ?? "NASDAQ"),
    ceo: ceo ? String((ceo as Record<string, unknown>).name ?? "N/A") : "N/A",
    employees: safeNum(ap.fullTimeEmployees),
    founded: "N/A",
    headquarters: [ap.city, ap.state, ap.country].filter(Boolean).join(", ") || "N/A",
    website: String(ap.website ?? ""),
    historicalPrices,
    financials,
  };

  cacheSet(cacheKey, detail, TTL.STOCK_DETAIL);
  return detail;
}
