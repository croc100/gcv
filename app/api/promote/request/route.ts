import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

const KEY = "promote_requests";

export async function POST(request: NextRequest) {
  const body = await request.json() as { full_name?: string; description?: string; contact?: string };
  if (!body.full_name || !body.contact) {
    return NextResponse.json({ error: "full_name and contact required" }, { status: 400 });
  }
  if (!body.full_name.includes("/")) {
    return NextResponse.json({ error: 'full_name must be "owner/repo"' }, { status: 400 });
  }

  const entry = {
    full_name: body.full_name.trim(),
    description: body.description?.trim() ?? "",
    contact: body.contact.trim(),
    submitted_at: Math.floor(Date.now() / 1000),
  };

  try {
    await kv.lpush(KEY, entry);
  } catch {
    return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
