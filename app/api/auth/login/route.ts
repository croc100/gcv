import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "OAuth not configured" }, { status: 501 });

  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/";
  const state = Buffer.from(JSON.stringify({ returnTo })).toString("base64url");

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString());
}
