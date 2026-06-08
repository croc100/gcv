"use client";

import { useState, useRef } from "react";
import { Contributor } from "@/lib/types";

interface OGShareModalProps {
  owner: string;
  repo: string;
  contributors: Contributor[];
  onClose: () => void;
}

export default function OGShareModal({ owner, repo, contributors, onClose }: OGShareModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = typeof window !== "undefined" ? window.location.origin : "";

  function buildUrl() {
    const c = contributors
      .filter((c) => selected.has(c.login))
      .map((c) => `${c.login}:${c.contributions}`)
      .join(",");
    return `${base}/api/og?owner=${owner}&repo=${repo}&c=${encodeURIComponent(c)}`;
  }

  function toggle(login: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(login)) { next.delete(login); } else { next.add(login); }
      return next;
    });
    setPreviewUrl(null);
    setGenerating(false);
  }

  function stopGenerating() {
    setGenerating(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function create() {
    // Reset preview first so spinner shows, then set URL on next tick
    setPreviewUrl(null);
    setGenerating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Fallback: reset after 15s if image never loads or errors
    timeoutRef.current = setTimeout(() => setGenerating(false), 15000);
    setTimeout(() => setPreviewUrl(buildUrl()), 0);
  }

  function copy() {
    if (!previewUrl) return;
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d] shrink-0">
          <div>
            <span className="text-sm font-medium text-[#e6edf3]">Share image</span>
            <span className="ml-2 text-xs text-[#484f58]">Select contributors to include</span>
          </div>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Contributor selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {contributors.slice(0, 18).map((c) => (
              <button
                key={c.login}
                onClick={() => toggle(c.login)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  selected.has(c.login)
                    ? "border-[#388bfd] bg-[#388bfd15]"
                    : "border-[#21262d] hover:border-[#30363d]"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                  selected.has(c.login) ? "border-[#388bfd] bg-[#388bfd]" : "border-[#484f58]"
                }`}>
                  {selected.has(c.login) && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.avatar_url} alt={c.login} width={24} height={24} className="rounded-full shrink-0" />
                <span className="text-xs text-[#e6edf3] truncate">{c.login}</span>
              </button>
            ))}
          </div>

          {/* Spinner while generating */}
          {generating && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div style={{ display: generating ? "none" : "block" }}>
              <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-2">Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="OG preview"
                onLoad={stopGenerating}
                onError={stopGenerating}
                className="w-full rounded-lg border border-[#21262d]"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-[#21262d] shrink-0">
          <span className="text-xs text-[#484f58] flex-1">{selected.size} contributor{selected.size !== 1 ? "s" : ""} selected</span>
          {previewUrl && !generating && (
            <button
              onClick={copy}
              className="px-4 py-2 text-xs rounded-lg border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#388bfd] transition-colors"
            >
              {copied ? "Copied!" : "Copy URL"}
            </button>
          )}
          {previewUrl && !generating && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs rounded-lg border border-[#30363d] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#388bfd] transition-colors"
            >
              Open image
            </a>
          )}
          <button
            onClick={create}
            disabled={selected.size === 0 || generating}
            className="px-4 py-2 text-xs rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-40 text-white transition-colors"
          >
            {generating ? "Generating..." : previewUrl ? "Regenerate" : "Create image"}
          </button>
        </div>
      </div>
    </div>
  );
}
