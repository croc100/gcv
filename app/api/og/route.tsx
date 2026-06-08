import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function toDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return "";
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${ct};base64,${btoa(binary)}`;
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner") ?? "";
  const repo = searchParams.get("repo") ?? "";
  const raw = searchParams.get("c") ?? "";

  const parsed = raw
    .split(",")
    .filter(Boolean)
    .slice(0, 9)
    .map((item) => {
      const colonIdx1 = item.indexOf(":");
      const colonIdx2 = item.indexOf(":", colonIdx1 + 1);
      const login = item.slice(0, colonIdx1);
      const commits = Number(item.slice(colonIdx1 + 1, colonIdx2 >= 0 ? colonIdx2 : undefined)) || 0;
      const avatarEncoded = colonIdx2 >= 0 ? item.slice(colonIdx2 + 1) : "";
      let avatar = "";
      try {
        avatar = avatarEncoded ? decodeURIComponent(avatarEncoded) : "";
      } catch {
        avatar = "";
      }
      return { login, commits, avatar };
    });

  const contributors = await Promise.all(
    parsed.map(async ({ login, commits, avatar }) => ({
      login,
      commits,
      avatarData: avatar ? await toDataUri(avatar) : "",
    }))
  );

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
          {contributors.map(({ login, commits, avatarData }) => (
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
              {avatarData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarData}
                  width={48}
                  height={48}
                  style={{ borderRadius: "50%" }}
                  alt={login}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#21262d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#7d8590",
                  }}
                >
                  {login[0]?.toUpperCase()}
                </div>
              )}
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
