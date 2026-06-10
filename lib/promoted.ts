import { kv } from "@vercel/kv";

export type PromotedRepo = {
  id: string;             // stripe checkout session id
  full_name: string;      // owner/repo
  description: string;
  url: string;            // github url
  stars: number;
  language: string | null;
  contact: string;        // email
  plan: "week" | "month";
  starts_at: number;      // unix timestamp
  ends_at: number;
  active: boolean;
};

const KEY = "promoted_repos";

export async function getActivePromotions(): Promise<PromotedRepo[]> {
  try {
    const all = await kv.lrange<PromotedRepo>(KEY, 0, -1);
    const now = Date.now() / 1000;
    return all.filter((r) => r.active && r.ends_at > now);
  } catch {
    return [];
  }
}

export async function addPromotion(repo: PromotedRepo): Promise<void> {
  await kv.lpush(KEY, repo);
}

export async function activatePromotion(sessionId: string): Promise<void> {
  const all = await kv.lrange<PromotedRepo>(KEY, 0, -1);
  for (let i = 0; i < all.length; i++) {
    if (all[i].id === sessionId) {
      all[i].active = true;
      await kv.lset(KEY, i, all[i]);
      return;
    }
  }
}
