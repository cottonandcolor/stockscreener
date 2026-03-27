import { NextResponse } from "next/server";
import { fetchSellSignals } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET() {
  const signals = await fetchSellSignals();
  return NextResponse.json({ signals });
}
