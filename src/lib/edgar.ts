import YahooFinance from "yahoo-finance2";
import { cacheGet, cacheSet, TTL } from "./cache";
import type { InsiderTrade } from "./stockData";
import { STOCK_DEFS } from "./stockData";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const SUB_10_CANDIDATES = [
  "NIO", "LCID", "AMC", "PLUG", "SPCE", "OPEN", "TLRY", "SNDL", "NOK",
  "BB", "CLOV", "DNA", "NKLA", "PSNY", "RIVN", "SOFI", "SNAP", "F",
  "WBD", "RIOT", "AAL", "CLSK", "MARA", "HIMS", "PATH", "GRAB", "ASTS",
  "JOBY", "PLTR", "HOOD", "GSAT", "RIG", "SWN", "TELL", "ET", "SIRI",
  "CCL", "VALE", "PBR", "ITUB", "NU", "ABEV", "BTG", "SID", "STNE",
  "T", "KGC", "GOLD", "CLF", "X", "LUMN", "COMM", "OXY",
];

function formatName(raw: string): string {
  const cleaned = raw.replace(/\.$/, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return cleaned;

  const formatted = parts.map((p) => {
    if (p.length <= 2 && p === p.toUpperCase()) return p;
    return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  });

  return formatted.join(" ");
}

function parseTransactionText(text: string): { type: "Buy" | "Sell" | null; price: number } {
  if (!text) return { type: null, price: 0 };

  const lower = text.toLowerCase();
  let type: "Buy" | "Sell" | null = null;
  if (lower.includes("purchase")) type = "Buy";
  else if (lower.includes("sale")) type = "Sell";
  else if (lower.includes("acquisition")) type = "Buy";
  else if (lower.includes("disposition")) type = "Sell";

  const priceMatch = text.match(/price\s+([\d,.]+)/i);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : 0;

  return { type, price };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchInsiderTrades(symbol: string, count = 10, nameOverride?: string): Promise<InsiderTrade[]> {
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `insider:${upperSymbol}`;
  const cached = cacheGet<InsiderTrade[]>(cacheKey);
  if (cached) return cached;

  const def = STOCK_DEFS.find((d) => d.symbol === upperSymbol);
  const companyName = nameOverride ?? def?.name ?? upperSymbol;

  const result = await yf.quoteSummary(upperSymbol, {
    modules: ["insiderTransactions", "insiderHolders"],
  }) as any;

  const rawTxns: any[] = result.insiderTransactions?.transactions ?? [];
  const holders: any[] = result.insiderHolders?.holders ?? [];

  const holderMap = new Map<string, { position: number; title: string }>();
  for (const h of holders) {
    const name = String(h.name ?? "").toUpperCase();
    holderMap.set(name, {
      position: h.positionDirect ?? 0,
      title: String(h.relation ?? "Insider"),
    });
  }

  const trades: InsiderTrade[] = [];

  for (const txn of rawTxns) {
    if (trades.length >= count) break;

    const { type, price } = parseTransactionText(String(txn.transactionText ?? ""));
    if (!type) continue;

    const shares = Math.abs(Number(txn.shares) || 0);
    if (shares === 0) continue;

    const pricePerShare = price || (txn.value && shares ? Math.abs(Number(txn.value)) / shares : 0);
    const totalValue = txn.value ? Math.abs(Number(txn.value)) : shares * pricePerShare;
    if (totalValue === 0) continue;

    const rawName = String(txn.filerName ?? "Unknown");
    const holderInfo = holderMap.get(rawName.toUpperCase().replace(/\.$/, ""));

    const dateStr = txn.startDate instanceof Date
      ? txn.startDate.toISOString().split("T")[0]
      : typeof txn.startDate === "string"
        ? txn.startDate.split("T")[0]
        : "";

    trades.push({
      id: trades.length + 1,
      symbol: upperSymbol,
      companyName,
      insiderName: formatName(rawName),
      title: String(txn.filerRelation ?? holderInfo?.title ?? "Insider"),
      tradeType: type,
      shares,
      pricePerShare: +pricePerShare.toFixed(2),
      totalValue: +totalValue.toFixed(0),
      date: dateStr,
      sharesOwned: holderInfo?.position ?? 0,
    });
  }

  if (trades.length > 0) {
    cacheSet(cacheKey, trades, TTL.INSIDER_TRADES);
  }
  return trades;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchAggregatedInsiderTrades(): Promise<InsiderTrade[]> {
  const cacheKey = "insider:all-aggregated";
  const cached = cacheGet<InsiderTrade[]>(cacheKey);
  if (cached) return cached;

  const majorSymbols = STOCK_DEFS
    .sort((a, b) => b.baseCap - a.baseCap)
    .slice(0, 15)
    .map((d) => d.symbol);

  const results = await Promise.allSettled(
    majorSymbols.map((sym) => fetchInsiderTrades(sym, 10))
  );

  const allTrades = results
    .filter((r): r is PromiseFulfilledResult<InsiderTrade[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  if (allTrades.length > 0) {
    cacheSet(cacheKey, allTrades, TTL.INSIDER_TRADES);
  }
  return allTrades;
}

export async function fetchTopInsiderTrades(count = 10): Promise<InsiderTrade[]> {
  const cacheKey = `insider:top:${count}`;
  const cached = cacheGet<InsiderTrade[]>(cacheKey);
  if (cached) return cached;

  const allTrades = await fetchAggregatedInsiderTrades();

  const topTrades = [...allTrades]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, count)
    .map((t, i) => ({ ...t, id: i + 1 }));

  if (topTrades.length > 0) {
    cacheSet(cacheKey, topTrades, TTL.INSIDER_TRADES);
  }
  return topTrades;
}

export async function fetchTopInsiderBuys(count = 10): Promise<InsiderTrade[]> {
  const cacheKey = `insider:top-buys:${count}`;
  const cached = cacheGet<InsiderTrade[]>(cacheKey);
  if (cached) return cached;

  const allTrades = await fetchAggregatedInsiderTrades();

  const topBuys = allTrades
    .filter((t) => t.tradeType === "Buy")
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, count)
    .map((t, i) => ({ ...t, id: i + 1 }));

  if (topBuys.length > 0) {
    cacheSet(cacheKey, topBuys, TTL.INSIDER_TRADES);
  }
  return topBuys;
}

export interface InsiderBuyUnder10 extends InsiderTrade {
  currentPrice: number;
}

export async function fetchInsiderBuysUnder10(count = 10): Promise<InsiderBuyUnder10[]> {
  const cacheKey = `insider:buys-under10:${count}`;
  const cached = cacheGet<InsiderBuyUnder10[]>(cacheKey);
  if (cached) return cached;

  const raw = await yf.quote(SUB_10_CANDIDATES, {}, { validateResult: false });
  const quotes = (Array.isArray(raw) ? raw : [raw]) as Record<string, any>[];

  const under10 = quotes
    .filter((q) => {
      const price = Number(q.regularMarketPrice ?? 0);
      return price > 0 && price < 10;
    })
    .map((q) => ({
      symbol: String(q.symbol ?? ""),
      name: String(q.longName ?? q.shortName ?? q.symbol ?? ""),
      price: Number(q.regularMarketPrice),
    }));

  const results = await Promise.allSettled(
    under10.map((s) => fetchInsiderTrades(s.symbol, 5, s.name))
  );

  const priceMap = new Map(under10.map((s) => [s.symbol, s.price]));

  const allBuys: InsiderBuyUnder10[] = results
    .filter((r): r is PromiseFulfilledResult<InsiderTrade[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((t) => t.tradeType === "Buy")
    .map((t) => ({ ...t, currentPrice: priceMap.get(t.symbol) ?? 0 }));

  const topBuys = allBuys
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, count)
    .map((t, i) => ({ ...t, id: i + 1 }));

  if (topBuys.length > 0) {
    cacheSet(cacheKey, topBuys, TTL.INSIDER_TRADES);
  }
  return topBuys;
}
