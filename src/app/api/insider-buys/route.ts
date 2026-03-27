import { NextResponse } from "next/server";
import { fetchInsiderBuysUnder10 } from "@/lib/edgar";

export const dynamic = "force-dynamic";

export async function GET() {
  const trades = await fetchInsiderBuysUnder10(10);
  return NextResponse.json({ trades });
}
