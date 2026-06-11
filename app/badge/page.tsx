"use client";

import { useState } from "react";
import Link from "next/link";

const EXAMPLES = [
  { owner: "vercel", repo: "next.js" },
  { owner: "facebook", repo: "react" },
  { owner: "microsoft", repo: "vscode" },
];

export default function BadgePage() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const base = typeof window !== "undefined" ? window.location.origin : "https://gcv-five.vercel.app";
  const valid = owner.trim() && repo.trim();
  const badgeUrl = valid ? `${base}/api/badge/${owner.trim()}/${repo.trim()}` : "";
  const pageUrl = valid ? `${base}/${owner.trim()}/${repo.trim()}` : "";
  const markdown = `[![Contributors](${badgeUrl})](${pageUrl})`;
  const html = `<a href="${pageUrl}"><img src="${badgeUrl}" alt="Contributors" /></a>`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#0d1117" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/" className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#e6edf3]">Contributor Badge</h1>
            <p className="text-xs text-[#7d8590]">Add a live contributors count badge to your README</p>
          </div>
        </div>

        {/* Generator */}
        <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-6 mb-6">
          <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Generate badge</p>
          <div className="flex items-center gap-2 mb-5">
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="owner"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors font-mono"
            />
            <span className="text-[#484f58]">/</span>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="repo"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors font-mono"
            />
          </div>

          {/* Live preview */}
          <div className="flex items-center justify-center py-5 rounded-lg bg-[#0d1117] border border-[#21262d] mb-5">
            {valid ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={badgeUrl} alt="badge preview" key={badgeUrl} />
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#484f58]">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M9 21V9" />
                </svg>
                Badge preview
              </div>
            )}
          </div>

          {/* Snippets */}
          {[
            { label: "Markdown", key: "md", value: markdown, disabled: !valid },
            { label: "HTML", key: "html", value: html, disabled: !valid },
            { label: "Direct URL", key: "url", value: badgeUrl, disabled: !valid },
          ].map(({ label, key, value, disabled }) => (
            <div key={key} className="mb-3">
              <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-1.5">{label}</p>
              <div className="flex items-center gap-2">
                <code className={`flex-1 text-xs bg-[#0d1117] border border-[#21262d] rounded-md px-3 py-2 truncate ${disabled ? "text-[#30363d]" : "text-[#7d8590]"}`}>
                  {disabled ? "Enter owner/repo above" : value}
                </code>
                <button
                  disabled={disabled}
                  onClick={() => copy(value, key)}
                  className="shrink-0 px-3 py-2 text-xs rounded-md border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#388bfd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {copied === key ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Health badge */}
        <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-1">Health badge</p>
              <p className="text-xs text-[#484f58]">Shows the community health score of your repo — bus factor, contributor diversity, and activity trend.</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/badge/health/vercel/next.js" alt="health badge preview" className="shrink-0" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
            <span className="text-[10px] text-[#7d8590]">70–100 · Healthy</span>
            <span className="w-2 h-2 rounded-full bg-[#d29922] ml-3" />
            <span className="text-[10px] text-[#7d8590]">40–69 · Fair</span>
            <span className="w-2 h-2 rounded-full bg-[#f85149] ml-3" />
            <span className="text-[10px] text-[#7d8590]">0–39 · At risk</span>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-1.5">Markdown</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] text-[#7d8590] bg-[#0d1117] border border-[#21262d] rounded-md px-3 py-2 truncate">
                {valid
                  ? `[![GCV Health](${base}/api/badge/health/${owner.trim()}/${repo.trim()})](${pageUrl})`
                  : "Enter owner/repo above to generate"}
              </code>
              <button
                disabled={!valid}
                onClick={() => copy(`[![GCV Health](${base}/api/badge/health/${owner.trim()}/${repo.trim()})](${pageUrl})`, "health-md")}
                className="shrink-0 px-3 py-2 text-xs rounded-md border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#388bfd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {copied === "health-md" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-[#0d1117] border border-[#21262d] text-[10px] text-[#484f58] leading-relaxed">
            Score = bus factor (40%) + contributor diversity (40%) + 4-week activity trend (20%)
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-6 mb-6">
          <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">How it works</p>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                title: "Paste in your README",
                desc: "Copy the Markdown snippet above and paste it into your repository's README.md.",
                code: `[![Contributors](https://gcv-five.vercel.app/api/badge/owner/repo)](https://gcv-five.vercel.app/owner/repo)`,
              },
              {
                step: "2",
                title: "Auto-updates every hour",
                desc: "The badge fetches a fresh contributor count and caches it for 1 hour. No setup, no tokens required.",
                code: null,
              },
              {
                step: "3",
                title: "Links to your GCV page",
                desc: "Clicking the badge takes visitors to your full contributors dashboard on GCV.",
                code: null,
              },
            ].map(({ step, title, desc, code }) => (
              <div key={step} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-[#21262d] text-[#7d8590] text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e6edf3] mb-0.5">{title}</p>
                  <p className="text-xs text-[#7d8590]">{desc}</p>
                  {code && (
                    <code className="mt-2 block text-[11px] text-[#7d8590] bg-[#0d1117] border border-[#21262d] rounded-md px-3 py-2 break-all">
                      {code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-6">
          <p className="text-xs font-medium text-[#7d8590] uppercase tracking-wide mb-4">Examples</p>
          <div className="flex flex-col gap-4">
            {EXAMPLES.map(({ owner: o, repo: r }) => (
              <div key={`${o}/${r}`} className="flex items-center justify-between gap-4">
                <Link href={`/${o}/${r}`} className="text-sm font-mono text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                  {o}/{r}
                </Link>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/badge/${o}/${r}`}
                  alt={`${o}/${r} contributors`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
