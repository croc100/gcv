"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RepoSearch() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = input.trim().replace(/^https?:\/\/github\.com\//, "");
    const parts = trimmed.split("/").filter(Boolean);

    if (parts.length === 1) {
      // Org dashboard
      router.push(`/org/${parts[0]}`);
      return;
    }

    if (parts.length < 2) {
      setError("Enter a repo (owner/repo) or an org name");
      return;
    }

    const [owner, repo] = parts;
    router.push(`/${owner}/${repo}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#484f58]" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="owner/repo, org name, or GitHub URL"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#30363d] bg-[#161b22] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] text-sm transition-colors"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          Explore
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-[#f85149]">{error}</p>}
    </form>
  );
}
