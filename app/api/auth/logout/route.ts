import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.delete(COOKIE_NAME);
  return response;
}
