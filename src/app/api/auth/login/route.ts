import { NextResponse } from "next/server";
import { z } from "zod";
import { authCookies, cookieOptions } from "@/features/auth/server/cookies";
import { directusFetch } from "@/lib/directus/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = loginSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ message: "Invalid login payload." }, { status: 400 });
  }

  const result = await directusFetch<{
    data: { access_token: string; refresh_token: string; expires: number };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ ...body.data, mode: "json" })
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message ?? "Unable to sign in." }, { status: result.status });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookies.accessToken, result.data.data.access_token, cookieOptions("access"));
  response.cookies.set(authCookies.refreshToken, result.data.data.refresh_token, cookieOptions("refresh"));

  return response;
}
