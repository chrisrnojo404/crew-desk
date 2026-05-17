import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookies, cookieOptions, expiredCookieOptions } from "@/features/auth/server/cookies";
import { directusFetch } from "@/lib/directus/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(authCookies.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Missing refresh token." }, { status: 401 });
  }

  const result = await directusFetch<{
    data: { access_token: string; refresh_token: string; expires: number };
  }>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken, mode: "json" })
  });

  if (!result.ok) {
    const response = NextResponse.json({ message: "Session expired." }, { status: 401 });
    response.cookies.set(authCookies.accessToken, "", expiredCookieOptions);
    response.cookies.set(authCookies.refreshToken, "", expiredCookieOptions);
    return response;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookies.accessToken, result.data.data.access_token, cookieOptions("access"));
  response.cookies.set(authCookies.refreshToken, result.data.data.refresh_token, cookieOptions("refresh"));
  return response;
}
