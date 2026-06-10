import RepoSearch from "@/components/RepoSearch";
import RecentRepos from "@/components/RecentRepos";
import SponsoredRepos from "@/components/SponsoredRepos";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#0d1117" }}>
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#30363d] bg-[#161b22] text-xs text-[#7d8590] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Open Source
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-3"
            style={{ background: "linear-gradient(135deg, #e6edf3 0%, #7d8590 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            GCV
          </h1>
          <p className="text-[#7d8590] text-base">
            Explore contributors of any GitHub repository
          </p>
        </div>

        <RepoSearch />

        <RecentRepos />

        <SponsoredRepos />

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-[#484f58]">Try a repo</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["vercel/next.js", "facebook/react", "microsoft/vscode", "golang/go"].map((r) => (
              <a
                key={r}
                href={`/${r}`}
                className="px-3 py-1.5 text-xs font-mono rounded-md border border-[#30363d] bg-[#161b22] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#58a6ff] transition-colors"
              >
                {r}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-[#484f58]">Or explore an org</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["vercel", "facebook", "microsoft", "golang"].map((org) => (
              <a
                key={org}
                href={`/org/${org}`}
                className="px-3 py-1.5 text-xs font-mono rounded-md border border-[#30363d] bg-[#161b22] text-[#7d8590] hover:text-[#e6edf3] hover:border-[#9e6a03] transition-colors flex items-center gap-1.5"
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="text-[#484f58]">
                  <path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM6.5 3.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-3-3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
                </svg>
                {org}
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
