import { NextRequest, NextResponse } from "next/server";
import { fetchComparison } from "@/lib/yahoo";
import type { CompareRange } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

const VALID_RANGES = new Set<CompareRange>(["1m", "3m", "6m", "1y", "2y", "5y"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const symbolsParam = params.get("symbols") ?? "";
  const rangeParam = (params.get("range") ?? "1y") as CompareRange;

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length < 2) {
    return NextResponse.json(
      { error: "Please provide at least 2 symbols (comma separated)." },
      { status: 400 }
    );
  }

  if (!VALID_RANGES.has(rangeParam)) {
    return NextResponse.json(
      { error: "Range must be one of: 1m, 3m, 6m, 1y, 2y, 5y." },
      { status: 400 }
    );
  }

  const result = await fetchComparison(symbols, rangeParam);
  if (!result) {
    return NextResponse.json(
      { error: "Unable to load comparison data for these symbols." },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
