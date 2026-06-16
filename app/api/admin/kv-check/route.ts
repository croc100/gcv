import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const payload = cookie ? await verifyAuth(cookie) : null;
  if (!payload || payload.login !== "croc100") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({
    KV_REST_API_URL: process.env.KV_REST_API_URL ? "set" : "MISSING",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "set" : "MISSING",
    VERCEL_KV_REST_API_URL: process.env.VERCEL_KV_REST_API_URL ? "set" : "MISSING",
    VERCEL_KV_REST_API_TOKEN: process.env.VERCEL_KV_REST_API_TOKEN ? "set" : "MISSING",
  });
}
