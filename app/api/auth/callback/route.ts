import { NextRequest, NextResponse } from "next/server";
import { signAuth, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  let returnTo = "/";
  try {
    const decoded = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    returnTo = decoded.returnTo ?? "/";
  } catch { /* ignore */ }

  if (!code) return NextResponse.redirect(new URL("/", origin));

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const { access_token, error } = await tokenRes.json();
  if (error || !access_token) return NextResponse.redirect(new URL("/", origin));

  // Fetch GitHub user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "gcv-app" },
  });
  const user = await userRes.json();

  const jwt = await signAuth({ token: access_token, login: user.login, avatar: user.avatar_url });

  const response = NextResponse.redirect(new URL(returnTo, origin));
  response.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
