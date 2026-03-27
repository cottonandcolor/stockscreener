import { NextResponse } from "next/server";
import { fetchTopInsiderTrades } from "@/lib/edgar";

export const dynamic = "force-dynamic";

export async function GET() {
  const trades = await fetchTopInsiderTrades(10);
  return NextResponse.json({ trades });
}
