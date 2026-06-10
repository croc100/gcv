"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    id: "week",
    label: "7 days",
    price: "$9",
    perDay: "$1.29/day",
    description: "Great for announcing a new release or feature",
  },
  {
    id: "month",
    label: "30 days",
    price: "$29",
    perDay: "$0.97/day",
    description: "Sustained visibility for ongoing contributor recruitment",
    popular: true,
  },
];

export default function PromotePage() {
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [plan, setPlan] = useState<"week" | "month">("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.includes("/")) {
      setError('Enter repo as "owner/repo"');
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/promote/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, description, contact, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.href = data.url;
    } catch (e: unknown) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#0d1117" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#e6edf3]">Promote your repo</h1>
            <p className="text-xs text-[#484f58] mt-0.5">Reach developers actively exploring open source projects</p>
          </div>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "👀", label: "Visibility", sub: "Shown on Trending, Explore & homepage" },
            { icon: "🧑‍💻", label: "Right audience", sub: "Developers looking for repos to contribute to" },
            { icon: "✅", label: "Honest", sub: "Clearly labeled Sponsored — no deception" },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="p-3 rounded-xl border border-[#21262d] bg-[#161b22] text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-xs font-semibold text-[#e6edf3]">{label}</p>
              <p className="text-[10px] text-[#484f58] mt-0.5 leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="mb-6">
          <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-3">Choose a plan</p>
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id as "week" | "month")}
                className={`relative text-left p-4 rounded-xl border transition-all ${
                  plan === p.id
                    ? "border-[#388bfd] bg-[#388bfd0d]"
                    : "border-[#21262d] bg-[#161b22] hover:border-[#30363d]"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-[#388bfd] text-white font-medium">
                    Popular
                  </span>
                )}
                <p className="text-xl font-black text-[#e6edf3]">{p.price}</p>
                <p className="text-xs font-semibold text-[#e6edf3] mt-0.5">{p.label}</p>
                <p className="text-[10px] text-[#484f58] mt-1">{p.perDay}</p>
                <p className="text-[10px] text-[#7d8590] mt-1.5 leading-relaxed">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#7d8590] block mb-1.5">
              GitHub repo <span className="text-[#f85149]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="owner/repo"
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd] font-mono transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#7d8590] block mb-1.5">
              Short description
              <span className="ml-1 text-[#484f58]">(optional — defaults to GitHub description)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes your repo worth contributing to?"
              rows={2}
              maxLength={160}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd] resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-[#7d8590] block mb-1.5">
              Email <span className="text-[#f85149]">*</span>
            </label>
            <input
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-[#f85149] px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !fullName || !contact}
            className="w-full py-3 text-sm font-semibold bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white rounded-lg transition-colors"
          >
            {loading ? "Redirecting to payment…" : `Continue to payment — ${PLANS.find((p) => p.id === plan)?.price}`}
          </button>

          <p className="text-[10px] text-[#484f58] text-center leading-relaxed">
            Secure payment via Stripe. Your repo will appear within minutes of payment confirmation.
            <br />
            Questions? <a href="mailto:contact@gcv-five.vercel.app" className="text-[#388bfd] hover:underline">Contact us</a>
          </p>
        </form>
      </div>
    </div>
  );
}
