import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const authCookies = {
  accessToken: "crew_desk_access_token",
  refreshToken: "crew_desk_refresh_token"
} as const;

export function cookieOptions(type: "access" | "refresh"): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: type === "access" ? 60 * 15 : 60 * 60 * 24 * 7
  };
}

export const expiredCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0
};
