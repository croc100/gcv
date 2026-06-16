import { kv } from "@vercel/kv";

export type PromotedRepo = {
  id: string;
  full_name: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  contact: string;
  plan: "week" | "month";
  starts_at: number;
  ends_at: number;
  active: boolean;
};

export type PromoteRequest = {
  full_name: string;
  description: string;
  contact: string;
  submitted_at: number;
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
