import { NextResponse } from "next/server";
import { fetchMarketNews } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await fetchMarketNews(30);
  return NextResponse.json({ articles });
}
