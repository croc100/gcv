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

    if (parts.length < 2) {
      setError("owner/repo 형식으로 입력해주세요 (예: vercel/next.js)");
      return;
    }

    const [owner, repo] = parts;
    router.push(`/${owner}/${repo}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="owner/repo 또는 GitHub URL"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          검색
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
}
