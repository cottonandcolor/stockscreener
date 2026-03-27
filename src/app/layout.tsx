import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import WatchlistProvider from "@/components/WatchlistProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Screener - Screen, Analyze & Track Stocks",
  description: "A powerful stock screener to filter, analyze, and track stocks with real-time data, charts, and watchlists. No login required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WatchlistProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
            Stock Screener &mdash; Live data from Yahoo Finance &amp; SEC EDGAR.
          </footer>
        </WatchlistProvider>
      </body>
    </html>
  );
}
