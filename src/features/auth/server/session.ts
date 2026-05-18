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

  const result = await directusFetch<{ data: SessionUser }>(
    "/users/me?fields=id,email,first_name,last_name,avatar,employee_id,phone_number,department,job_title,manager,role.id,role.name",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    }
  );

  if (!result.ok) {
    return null;
  }

  return result.data.data;
}

export async function getSessionAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(authCookies.accessToken)?.value ?? null;
}

export function canManageUsers(user: SessionUser | null) {
  const roleName = user?.role?.name?.toLowerCase();
  return Boolean(roleName === "admin" || roleName === "administrator" || roleName === "hr");
}
