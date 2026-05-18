import { getSessionAccessToken } from "@/features/auth/server/session";
import { directusFetch } from "@/lib/directus/server";

export async function directusSessionFetch<T>(path: string, init: RequestInit = {}) {
  const accessToken = await getSessionAccessToken();

  if (!accessToken) {
    return { ok: false as const, status: 401, message: "Not authenticated." };
  }

  return directusFetch<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...init.headers
    },
    cache: "no-store"
  });
}
