"use client";

import { useState } from "react";

interface BadgeModalProps {
  owner: string;
  repo: string;
  onClose: () => void;
}

export default function BadgeModal({ owner, repo, onClose }: BadgeModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const badgeUrl = `${base}/api/badge/${owner}/${repo}`;
  const pageUrl = `${base}/${owner}/${repo}`;
  const markdown = `[![Contributors](${badgeUrl})](${pageUrl})`;
  const html = `<a href="${pageUrl}"><img src="${badgeUrl}" alt="Contributors" /></a>`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <span className="text-sm font-medium text-[#e6edf3]">Badge for README</span>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Preview */}
          <div className="flex items-center justify-center py-4 rounded-lg bg-[#0d1117] border border-[#21262d]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badgeUrl} alt="badge preview" />
          </div>

          {/* Snippets */}
          {[
            { label: "Markdown", key: "md", value: markdown },
            { label: "HTML", key: "html", value: html },
            { label: "URL", key: "url", value: badgeUrl },
          ].map(({ label, key, value }) => (
            <div key={key}>
              <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-1.5">{label}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-[#7d8590] bg-[#0d1117] border border-[#21262d] rounded-md px-3 py-2 truncate">
                  {value}
                </code>
                <button
                  onClick={() => copy(value, key)}
                  className="shrink-0 px-3 py-2 text-xs rounded-md border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#388bfd] transition-colors"
                >
                  {copied === key ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
