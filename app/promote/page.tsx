"use client";

import { useState } from "react";
import Link from "next/link";

export default function PromotePage() {
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
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
      const res = await fetch("/api/promote/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, description, contact }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setDone(true);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#0d1117" }}>
      <div className="max-w-xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#e6edf3]">Feature your repo</h1>
            <p className="text-xs text-[#484f58] mt-0.5">Get your project in front of developers exploring open source</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Visibility", sub: "Shown on homepage & Explore" },
            { label: "Right audience", sub: "Developers looking to contribute" },
            { label: "Free", sub: "No cost during early access" },
          ].map(({ label, sub }) => (
            <div key={label} className="p-3 rounded-xl border border-[#21262d] bg-[#161b22] text-center">
              <p className="text-xs font-semibold text-[#e6edf3]">{label}</p>
              <p className="text-[10px] text-[#484f58] mt-1 leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>

        {done ? (
          <div className="rounded-xl border border-[#3fb95040] bg-[#3fb95010] p-8 text-center">
            <p className="text-2xl mb-3">✓</p>
            <p className="text-sm font-semibold text-[#e6edf3] mb-1">Request received</p>
            <p className="text-xs text-[#7d8590]">We&apos;ll review your repo and get back to you at <span className="text-[#e6edf3]">{contact}</span>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-5 flex flex-col gap-4">
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
                  <span className="ml-1 text-[#484f58]">(optional)</span>
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
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd] transition-colors"
                />
              </div>
            </div>

            {error && <p className="text-xs text-[#f85149] px-1">{error}</p>}

            <button
              type="submit"
              disabled={loading || !fullName || !contact}
              className="w-full py-3 text-sm font-semibold bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white rounded-lg transition-colors"
            >
              {loading ? "Submitting…" : "Submit request"}
            </button>

            <p className="text-[10px] text-[#484f58] text-center">
              Free during early access. We&apos;ll review and respond within 24 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
