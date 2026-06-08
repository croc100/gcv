import RepoSearch from "@/components/RepoSearch";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0d1117" }}>
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

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-[#484f58]">Try these</p>
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

      </div>
    </main>
  );
}
