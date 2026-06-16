"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PromotedRepo } from "@/lib/promoted";

type FormState = {
  full_name: string;
  description: string;
  contact: string;
  plan: "week" | "month";
};

const EMPTY_FORM: FormState = { full_name: "", description: "", contact: "", plan: "week" };

function fmt(ts: number) {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [promotions, setPromotions] = useState<PromotedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user?.login !== "croc100") { router.replace("/"); return; }
      setAuthed(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    fetchPromotions();
  }, [authed]);

  async function fetchPromotions() {
    setLoading(true);
    const res = await fetch("/api/admin/promotions");
    if (res.ok) setPromotions(await res.json());
    setLoading(false);
  }

  async function handleAdd() {
    if (!form.full_name.trim()) return;
    setAdding(true);
    setError("");
    try {
      // Fetch repo info from GitHub
      const ghRes = await fetch(`https://api.github.com/repos/${form.full_name.trim()}`);
      const gh = ghRes.ok ? await ghRes.json() : {};
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          description: form.description || gh.description || "",
          url: gh.html_url ?? `https://github.com/${form.full_name.trim()}`,
          stars: gh.stargazers_count ?? 0,
          language: gh.language ?? null,
          contact: form.contact,
          plan: form.plan,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchPromotions();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/admin/promotions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    setPromotions((prev) => prev.map((p) => p.id === id ? { ...p, active } : p));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotion?")) return;
    await fetch("/api/admin/promotions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }

  if (authed === null) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1117" }}>
      <div className="w-5 h-5 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const now = Math.floor(Date.now() / 1000);
  const active = promotions.filter((p) => p.active && p.ends_at > now);
  const inactive = promotions.filter((p) => !p.active || p.ends_at <= now);

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "#0d1117" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#388bfd20] text-[#388bfd] border border-[#388bfd40]">Admin</span>
              <h1 className="text-lg font-bold text-[#e6edf3]">Promotions</h1>
            </div>
            <p className="text-xs text-[#484f58]">{active.length} active · {promotions.length} total</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add repo
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="rounded-xl border border-[#388bfd40] bg-[#161b22] p-5 mb-6">
            <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">New promoted repo</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[#484f58] uppercase tracking-widest block mb-1">Repo (owner/repo)</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="vercel/next.js"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#484f58] uppercase tracking-widest block mb-1">Description (optional — auto-fetched if blank)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Leave blank to fetch from GitHub"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#484f58] uppercase tracking-widest block mb-1">Contact email</label>
                <input
                  type="email"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#388bfd]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#484f58] uppercase tracking-widest block mb-1">Plan</label>
                <div className="flex gap-2">
                  {(["week", "month"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, plan: p }))}
                      className={`px-4 py-1.5 text-xs rounded-md border transition-colors ${form.plan === p ? "border-[#388bfd] text-[#388bfd] bg-[#388bfd10]" : "border-[#30363d] text-[#7d8590]"}`}
                    >
                      {p === "week" ? "7 days" : "30 days"}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-[#f85149]">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(""); }} className="px-4 py-2 text-xs rounded-lg border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding || !form.full_name.trim()}
                  className="px-4 py-2 text-xs rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white transition-colors disabled:opacity-40"
                >
                  {adding ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 text-[#484f58] text-sm">No promotions yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {[...active, ...inactive].map((p) => {
              const expired = p.ends_at <= now;
              const statusColor = p.active && !expired ? "#3fb950" : expired ? "#484f58" : "#d29922";
              const statusLabel = expired ? "Expired" : p.active ? "Active" : "Paused";
              return (
                <div key={p.id} className="rounded-xl border border-[#21262d] bg-[#161b22] p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: statusColor, borderColor: statusColor + "40", background: statusColor + "10" }}>
                          {statusLabel}
                        </span>
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm font-mono font-semibold text-[#e6edf3] hover:text-[#58a6ff] transition-colors">
                          {p.full_name}
                        </a>
                        {p.language && <span className="text-[10px] text-[#484f58]">{p.language}</span>}
                      </div>
                      {p.description && <p className="text-xs text-[#7d8590] mb-1.5 line-clamp-1">{p.description}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-[#484f58]">
                        <span>{fmt(p.starts_at)} → {fmt(p.ends_at)}</span>
                        <span>Plan: {p.plan}</span>
                        {p.contact && <span>Contact: {p.contact}</span>}
                        {p.id.startsWith("admin_") && <span className="text-[#388bfd]">Manual</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!expired && (
                        <button
                          onClick={() => toggleActive(p.id, !p.active)}
                          className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${p.active ? "border-[#d29922] text-[#d29922] hover:bg-[#d2992210]" : "border-[#3fb950] text-[#3fb950] hover:bg-[#3fb95010]"}`}
                        >
                          {p.active ? "Pause" : "Activate"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 text-xs rounded-md border border-[#da3633] text-[#f85149] hover:bg-[#da363310] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
