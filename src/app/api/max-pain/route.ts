import { NextRequest, NextResponse } from "next/server";
import { fetchMaxPain } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");
  const date = params.get("date") || undefined;

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const result = await fetchMaxPain(symbol, date);
    if (!result) {
      return NextResponse.json(
        { error: "No options data available for this symbol/date" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch options data" },
      { status: 500 }
    );
  }
}
