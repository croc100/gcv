import { NextResponse } from "next/server";
import { getActivePromotions } from "@/lib/promoted";

export const dynamic = "force-dynamic";

export async function GET() {
  const promotions = await getActivePromotions();
  return NextResponse.json({ promotions });
}
