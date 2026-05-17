import { cookies } from "next/headers";
import { authCookies } from "@/features/auth/server/cookies";
import type { SessionUser } from "@/features/auth/types";
import { directusFetch } from "@/lib/directus/server";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authCookies.accessToken)?.value;

  if (!accessToken) {
    return null;
  }

  const result = await directusFetch<{ data: SessionUser }>("/users/me?fields=id,email,first_name,last_name,avatar,role", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!result.ok) {
    return null;
  }

  return result.data.data;
}
