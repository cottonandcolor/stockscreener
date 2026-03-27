"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Search, Star, TrendingUp } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: TrendingUp },
  { href: "/screener", label: "Screener", icon: Search },
  { href: "/watchlist", label: "Watchlist", icon: Star },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-emerald-400 transition-colors">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            <span>Stock Screener</span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
