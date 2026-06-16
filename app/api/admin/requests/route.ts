import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { verifyAuth, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN = "croc100";

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuth(cookie);
  if (!payload || payload.login !== ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  const err = await requireAdmin(request);
  if (err) return err;
  try {
    const all = await kv.lrange("promote_requests", 0, -1);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json([]);
  }
}
