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

type ActivityStats = {
  prs: number;
  issues: number;
};

interface ContributorDrawerProps {
  login: string | null;
  owner?: string;
  repo?: string;
  commits?: number;
  onClose: () => void;
}

export default function ContributorDrawer({ login, owner, repo, commits, onClose }: ContributorDrawerProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityStats | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (!login) return;
    setUser(null);
    setRepos([]);
    setFetchError(null);
    setActivity(null);
    setLoading(true);

    const token = localStorage.getItem("github_token") ?? "";
    const headers: Record<string, string> = {};
    if (token) headers["x-github-token"] = token;

    fetch(`/api/github/user?login=${login}`, { headers })
      .then((r) => r.json())
      .then(({ user, repos, error }) => {
        if (error) { setFetchError(error); return; }
        setUser(user);
        setRepos(repos ?? []);
      })
      .catch((e) => setFetchError(e.message ?? "Failed to load profile"))
      .finally(() => setLoading(false));

    // Fetch PR/Issue stats if owner/repo provided
    if (owner && repo) {
      setActivityLoading(true);
      fetch(`/api/github/activity?owner=${owner}&repo=${repo}&login=${login}`, { headers })
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setActivity(data);
        })
        .catch(() => {/* silently fail */})
        .finally(() => setActivityLoading(false));
    }
  }, [login, owner, repo]);

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

          {!loading && fetchError && (
            <p className="text-xs text-[#f85149] text-center py-16">{fetchError}</p>
          )}

          {!loading && !fetchError && user && (
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
                <div className="flex gap-2 w-full">
                  <a
                    href={`/u/${user.login}`}
                    className="flex-1 py-1.5 text-xs text-center border border-[#388bfd] rounded-lg text-[#388bfd] hover:bg-[#388bfd15] transition-colors"
                  >
                    GCV Profile
                  </a>
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 text-xs text-center border border-[#30363d] rounded-lg text-[#7d8590] hover:border-[#388bfd] hover:text-[#e6edf3] transition-colors"
                  >
                    GitHub
                  </a>
                </div>
              </div>

              {/* Repo contribution stats */}
              {(commits !== undefined || owner) && (
                <div>
                  <p className="text-[10px] font-medium text-[#484f58] uppercase tracking-widest mb-2">
                    Repo contributions
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {commits !== undefined && (
                      <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#57ab5a">
                          <path d="M1.643 3.143L.427 1.927A.25.25 0 0 0 0 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z" />
                        </svg>
                        <span className="text-sm font-semibold text-[#e6edf3]">{commits.toLocaleString()}</span>
                        <span className="text-[10px] text-[#484f58]">commits</span>
                      </div>
                    )}
                    {activityLoading ? (
                      <>
                        <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                          <div className="w-3 h-3 border border-[#388bfd] border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                          <div className="w-3 h-3 border border-[#388bfd] border-t-transparent rounded-full animate-spin" />
                        </div>
                      </>
                    ) : activity ? (
                      <>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="#388bfd">
                            <path d="M7.177 3.073L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM.75 5h1.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 .75 5ZM.75 8h1.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 .75 8ZM.75 11h1.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 .75 11Z" />
                          </svg>
                          <span className="text-sm font-semibold text-[#e6edf3]">{activity.prs.toLocaleString()}</span>
                          <span className="text-[10px] text-[#484f58]">PRs</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="#da3633">
                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                          </svg>
                          <span className="text-sm font-semibold text-[#e6edf3]">{activity.issues.toLocaleString()}</span>
                          <span className="text-[10px] text-[#484f58]">issues</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )}

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
