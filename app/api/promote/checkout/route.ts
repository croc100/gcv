import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { kv } from "@vercel/kv";
import type { PromotedRepo } from "@/lib/promoted";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PLANS = {
  week:  { price: 900,  days: 7,  label: "7-day promotion" },
  month: { price: 2900, days: 30, label: "30-day promotion" },
};

export async function POST(req: NextRequest) {
  try {
    const { full_name, description, contact, plan } = await req.json() as {
      full_name: string;
      description: string;
      contact: string;
      plan: "week" | "month";
    };

    if (!full_name || !contact || !PLANS[plan]) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const [owner, repo] = full_name.split("/");
    if (!owner || !repo) {
      return NextResponse.json({ error: "Invalid repo format (owner/repo)" }, { status: 400 });
    }

    // Fetch real GitHub repo data to validate and get metadata
    const ghRes = await fetch(`https://api.github.com/repos/${full_name}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "GCV" },
    });
    if (!ghRes.ok) {
      return NextResponse.json({ error: "Repo not found on GitHub" }, { status: 404 });
    }
    const ghData = await ghRes.json();

    const { days } = PLANS[plan];
    const now = Math.floor(Date.now() / 1000);
    const pendingRepo: PromotedRepo = {
      id: "",  // filled after checkout session created
      full_name,
      description: description || ghData.description || "",
      url: ghData.html_url,
      stars: ghData.stargazers_count,
      language: ghData.language ?? null,
      contact,
      plan,
      starts_at: now,
      ends_at: now + days * 86400,
      active: false,
    };

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gcv-five.vercel.app";
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: PLANS[plan].price,
          product_data: {
            name: PLANS[plan].label,
            description: `Promote ${full_name} on GCV for ${days} days`,
          },
        },
        quantity: 1,
      }],
      customer_email: contact,
      success_url: `${base}/promote/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/promote`,
      metadata: { full_name, plan },
    });

    pendingRepo.id = session.id;
    await kv.lpush("promoted_repos", pendingRepo);

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
