import { NextResponse } from "next/server";
import { authCookies, expiredCookieOptions } from "@/features/auth/server/cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookies.accessToken, "", expiredCookieOptions);
  response.cookies.set(authCookies.refreshToken, "", expiredCookieOptions);
  return response;
}
