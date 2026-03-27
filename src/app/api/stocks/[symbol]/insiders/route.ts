import { NextResponse } from "next/server";
import { fetchInsiderTrades } from "@/lib/edgar";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const trades = await fetchInsiderTrades(symbol, 10);
  return NextResponse.json({ trades });
}
