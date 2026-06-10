import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Only apply to GitHub API proxy routes
  if (!request.nextUrl.pathname.startsWith("/api/github")) {
    return NextResponse.next();
  }

  // If client already sent a manual token, respect it
  if (request.headers.get("x-github-token")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return NextResponse.next();

  const payload = await verifyAuth(cookie);
  if (!payload?.token) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("x-github-token", payload.token);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/api/github/:path*",
};
