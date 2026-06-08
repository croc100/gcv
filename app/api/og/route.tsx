import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner") ?? "";
  const repo = searchParams.get("repo") ?? "";
  const raw = searchParams.get("c") ?? "";

  const contributors = raw
    .split(",")
    .filter(Boolean)
    .slice(0, 9)
    .map((item) => {
      const [login, commits] = item.split(":");
      return { login, commits: Number(commits) || 0 };
    });

  const totalCommits = contributors.reduce((s, c) => s + c.commits, 0);
  const maxCommits = Math.max(...contributors.map((c) => c.commits), 1);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0d1117",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 3, background: "linear-gradient(to right, #388bfd, #56d364)", flexShrink: 0, display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "44px 60px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#388bfd", letterSpacing: 3 }}>
                GITHUB CONTRIBUTOR VIEWER
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: "#7d8590", fontWeight: 400 }}>{owner}</span>
                <span style={{ fontSize: 13, color: "#484f58" }}>/</span>
                <span style={{ fontSize: 30, fontWeight: 700, color: "#e6edf3", lineHeight: 1.1 }}>{repo}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: "#e6edf3", lineHeight: 1 }}>
                {`${contributors.length}`}
              </span>
              <span style={{ fontSize: 13, color: "#7d8590", marginTop: 4 }}>
                {contributors.length === 1 ? "contributor" : "contributors"}
              </span>
            </div>
          </div>

          {/* Contributors */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1, alignContent: "flex-start" }}>
            {contributors.map(({ login, commits }) => (
              <div
                key={login}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: 14,
                  padding: "18px 14px 14px",
                  width: 172,
                  gap: 10,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://github.com/${login}.png?size=64`}
                  width={56}
                  height={56}
                  style={{ borderRadius: "50%", border: "2px solid #30363d" }}
                  alt={login}
                />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", textAlign: "center" }}>
                    {login}
                  </span>
                  {/* Commit bar */}
                  <div style={{ width: "100%", height: 3, background: "#21262d", borderRadius: 2, display: "flex" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background: "linear-gradient(to right, #388bfd, #56d364)",
                        width: `${Math.round((commits / maxCommits) * 100)}%`,
                        display: "flex",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#7d8590" }}>
                    {`${commits.toLocaleString()} ${commits === 1 ? "commit" : "commits"}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
            <span style={{ fontSize: 12, color: "#484f58" }}>gcv-five.vercel.app</span>
            <span style={{ fontSize: 12, color: "#484f58" }}>
              {`${totalCommits.toLocaleString()} commits total`}
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
