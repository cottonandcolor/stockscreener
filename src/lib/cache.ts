interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export const TTL = {
  QUOTES: 5 * 60 * 1000,         // 5 minutes
  STOCK_DETAIL: 15 * 60 * 1000,  // 15 minutes
  HISTORICAL: 30 * 60 * 1000,    // 30 minutes
  INSIDER_TRADES: 60 * 60 * 1000, // 1 hour
  CIK_MAP: 24 * 60 * 60 * 1000,  // 24 hours
};
