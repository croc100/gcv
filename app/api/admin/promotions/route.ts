import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { verifyAuth, COOKIE_NAME } from "@/lib/auth";
import type { PromotedRepo } from "@/lib/promoted";

export const dynamic = "force-dynamic";

const ADMIN = "croc100";
const KEY = "promoted_repos";

async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await verifyAuth(cookie);
  if (!payload || payload.login !== ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

// GET — all promotions (active + inactive + expired)
export async function GET(request: NextRequest) {
  const err = await requireAdmin(request);
  if (err) return err;
  try {
    const all = await kv.lrange<PromotedRepo>(KEY, 0, -1);
    return NextResponse.json(all);
  } catch {
    return NextResponse.json([]);
  }
}

// POST — add a promotion manually
export async function POST(request: NextRequest) {
  const err = await requireAdmin(request);
  if (err) return err;
  const body = await request.json() as Partial<PromotedRepo>;
  if (!body.full_name) return NextResponse.json({ error: "full_name required" }, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const days = body.plan === "month" ? 30 : 7;
  const repo: PromotedRepo = {
    id: `admin_${Date.now()}`,
    full_name: body.full_name,
    description: body.description ?? "",
    url: body.url ?? `https://github.com/${body.full_name}`,
    stars: body.stars ?? 0,
    language: body.language ?? null,
    contact: body.contact ?? "",
    plan: body.plan ?? "week",
    starts_at: now,
    ends_at: now + days * 86400,
    active: true,
  };
  await kv.lpush(KEY, repo);
  return NextResponse.json(repo, { status: 201 });
}

// PATCH — toggle active on a promotion by id
export async function PATCH(request: NextRequest) {
  const err = await requireAdmin(request);
  if (err) return err;
  const { id, active } = await request.json() as { id: string; active: boolean };
  const all = await kv.lrange<PromotedRepo>(KEY, 0, -1);
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === id) {
      all[i].active = active;
      await kv.lset(KEY, i, all[i]);
      return NextResponse.json(all[i]);
    }
  }
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// DELETE — remove a promotion by id
export async function DELETE(request: NextRequest) {
  const err = await requireAdmin(request);
  if (err) return err;
  const { id } = await request.json() as { id: string };
  const all = await kv.lrange<PromotedRepo>(KEY, 0, -1);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // KV list doesn't support remove-by-index directly — rebuild without the item
  await kv.del(KEY);
  const remaining = all.filter((_, i) => i !== idx);
  if (remaining.length > 0) await kv.rpush(KEY, ...remaining);
  return NextResponse.json({ ok: true });
}
