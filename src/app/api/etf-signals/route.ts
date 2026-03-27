import { NextResponse } from "next/server";
import { fetchETFBuySignals, fetchETFSellSignals } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET() {
  const [buy, sell] = await Promise.all([fetchETFBuySignals(), fetchETFSellSignals()]);
  return NextResponse.json({ buy, sell });
}
