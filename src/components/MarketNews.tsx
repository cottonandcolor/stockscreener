"use client";

import { useEffect, useState } from "react";
import {
  Newspaper,
  Loader2,
  ExternalLink,
  Clock,
  Tag,
  ChevronDown,
} from "lucide-react";

interface NewsArticle {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
  thumbnail: string | null;
  relatedTickers: string[];
  type: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function MarketNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setArticles(d.articles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Market News</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading news...
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Market News</h2>
        </div>
        <p className="text-sm text-slate-400 text-center py-8">No news available right now.</p>
      </div>
    );
  }

  const visible = articles.slice(0, showCount);
  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Market News</h2>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          Live from Yahoo Finance
        </span>
      </div>

      {/* Featured Article */}
      {featured && (
        <a
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-5 group"
        >
          <div className="relative rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500/40 transition-colors">
            {featured.thumbnail && (
              <div className="h-48 w-full bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.thumbnail}
                  alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </div>
            )}
            <div className={`p-4 ${featured.thumbnail ? "" : "pt-4"}`}>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wide mb-2">
                <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold">
                  Featured
                </span>
                <span>{featured.publisher}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {timeAgo(featured.publishedAt)}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors leading-snug">
                {featured.title}
              </h3>
              {featured.relatedTickers.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {featured.relatedTickers.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </a>
      )}

      {/* News List */}
      <div className="space-y-1">
        {rest.map((article) => (
          <a
            key={article.uuid}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors group"
          >
            {article.thumbnail && (
              <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.thumbnail}
                  alt=""
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-slate-200 group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                <span className="font-medium">{article.publisher}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {timeAgo(article.publishedAt)}
                </span>
                {article.relatedTickers.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {article.relatedTickers.slice(0, 3).join(", ")}
                  </span>
                )}
                <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Show More */}
      {showCount < articles.length && (
        <button
          onClick={() => setShowCount((c) => c + 10)}
          className="w-full mt-4 flex items-center justify-center gap-1 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Show More ({articles.length - showCount} remaining)
        </button>
      )}
    </div>
  );
}
