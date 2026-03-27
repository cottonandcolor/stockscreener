import { NextResponse } from "next/server";
import { fetchETFFlows } from "@/lib/yahoo";

export const dynamic = "force-dynamic";

export async function GET() {
  const flows = await fetchETFFlows();
  return NextResponse.json({ flows });
}
