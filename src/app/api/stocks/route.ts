import { NextResponse } from "next/server";
import { fetchAllQuotes } from "@/lib/yahoo";
import { getSectors, getIndustries } from "@/lib/stockData";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stocks, sectors, industries] = await Promise.all([
    fetchAllQuotes(),
    Promise.resolve(getSectors()),
    Promise.resolve(getIndustries()),
  ]);

  return NextResponse.json({ stocks, sectors, industries });
}
