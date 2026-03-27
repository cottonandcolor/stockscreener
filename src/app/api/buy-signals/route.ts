import { NextResponse } from "next/server";
import { fetchBuySignals } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET() {
  const signals = await fetchBuySignals();
  return NextResponse.json({ signals });
}
