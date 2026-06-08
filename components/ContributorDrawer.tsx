"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
};

type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

interface ContributorDrawerProps {
  login: string | null;
  onClose: () => void;
}

export default function ContributorDrawer({ login, onClose }: ContributorDrawerProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!login) return;
    setUser(null);
    setRepos([]);
    setLoading(true);

    const token = localStorage.getItem("github_token") ?? "";
    const headers: Record<string, string> = {};
    if (token) headers["x-github-token"] = token;

    fetch(`/api/github/user?login=${login}`, { headers })
      .then((r) => r.json())
      .then(({ user, repos }) => {
        setUser(user);
        setRepos(repos ?? []);
      })
      .finally(() => setLoading(false));
  }, [login]);

  const open = !!login;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 flex flex-col border-l border-[#21262d] bg-[#161b22] shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <span className="text-sm font-medium text-[#e6edf3]">Contributor</span>
          <button onClick={onClose} className="text-[#7d8590] hover:text-[#e6edf3] transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-5 h-5 border-2 border-[#388bfd] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && user && (
            <div className="flex flex-col gap-5">
              {/* Profile */}
              <div className="flex flex-col items-center gap-3 text-center">
                <Image
                  src={user.avatar_url}
                  alt={user.login}
                  width={72}
                  height={72}
                  className="rounded-full ring-2 ring-[#30363d]"
                />
                <div>
                  {user.name && (
                    <p className="font-semibold text-[#e6edf3]">{user.name}</p>
                  )}
                  <p className="text-sm text-[#7d8590]">@{user.login}</p>
                </div>
                {user.bio && (
                  <p className="text-xs text-[#7d8590] leading-relaxed">{user.bio}</p>
                )}
                <div className="flex gap-4 text-xs text-[#7d8590]">
                  <span><strong className="text-[#e6edf3]">{user.followers.toLocaleString()}</strong> followers</span>
                  <span><strong className="text-[#e6edf3]">{user.following.toLocaleString()}</strong> following</span>
                </div>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 text-xs text-center border border-[#30363d] rounded-lg text-[#7d8590] hover:border-[#388bfd] hover:text-[#e6edf3] transition-colors"
                >
                  View on GitHub
                </a>
              </div>

              {/* Repos */}
              {repos.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-2">
                    Top repositories
                  </p>
                  <div className="flex flex-col gap-2">
                    {repos.map((r) => (
                      <a
                        key={r.id}
                        href={r.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg border border-[#21262d] hover:border-[#388bfd] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#e6edf3] truncate">{r.name}</span>
                          <span className="flex items-center gap-1 text-[10px] text-[#7d8590] shrink-0">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                            </svg>
                            {r.stargazers_count.toLocaleString()}
                          </span>
                        </div>
                        {r.description && (
                          <p className="text-[10px] text-[#484f58] mt-1 line-clamp-2">{r.description}</p>
                        )}
                        {r.language && (
                          <span className="mt-1.5 inline-block text-[10px] text-[#7d8590]">{r.language}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
