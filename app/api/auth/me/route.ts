import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const configured = !!process.env.GITHUB_CLIENT_ID;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!cookie) return NextResponse.json({ configured, user: null });

  const payload = await verifyAuth(cookie);
  if (!payload) return NextResponse.json({ configured, user: null });

  return NextResponse.json({ configured, user: { login: payload.login, avatar: payload.avatar } });
}
