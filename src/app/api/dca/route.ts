import { NextRequest, NextResponse } from "next/server";
import { fetchDCASimulation } from "@/lib/yahoo";
import type { DCAInput } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");
  const totalAmount = Number(params.get("amount") || 0);
  const months = Number(params.get("months") || 12);
  const frequency = (params.get("frequency") || "monthly") as DCAInput["frequency"];

  if (!symbol || totalAmount <= 0) {
    return NextResponse.json({ error: "symbol and amount are required" }, { status: 400 });
  }

  if (!["weekly", "biweekly", "monthly"].includes(frequency)) {
    return NextResponse.json({ error: "frequency must be weekly, biweekly, or monthly" }, { status: 400 });
  }

  const result = await fetchDCASimulation({ symbol, totalAmount, months, frequency });

  if (!result) {
    return NextResponse.json({ error: "Could not fetch historical data for this symbol" }, { status: 404 });
  }

  return NextResponse.json(result);
}
