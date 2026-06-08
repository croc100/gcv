import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

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
      const [login, commits, avatar] = item.split(":");
      return {
        login,
        commits: Number(commits) || 0,
        avatar: avatar
          ? decodeURIComponent(avatar)
          : `https://avatars.githubusercontent.com/${login}`,
      };
    });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0d1117",
          padding: "48px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#7d8590", letterSpacing: 4 }}>
              GCV
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#e6edf3", marginTop: 4 }}>
              {owner}/{repo}
            </div>
          </div>
        </div>

        {/* Contributors grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, flex: 1 }}>
          {contributors.map(({ login, commits, avatar }) => (
            <div
              key={login}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: 12,
                padding: "12px 16px",
                minWidth: 200,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                width={48}
                height={48}
                style={{ borderRadius: "50%" }}
                alt={login}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#e6edf3" }}>{login}</span>
                <span style={{ fontSize: 13, color: "#7d8590", marginTop: 2 }}>
                  {commits.toLocaleString()} commits
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 32 }}>
          <span style={{ fontSize: 14, color: "#484f58" }}>gcv-five.vercel.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
