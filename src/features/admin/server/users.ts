import type { DirectusRole, DirectoryUser } from "@/features/admin/types";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";

export async function listDirectoryUsers() {
  const fields = [
    "id",
    "email",
    "first_name",
    "last_name",
    "employee_id",
    "phone_number",
    "department",
    "job_title",
    "status",
    "last_access",
    "role.id",
    "role.name",
    "manager.id",
    "manager.first_name",
    "manager.last_name",
    "manager.email"
  ].join(",");

  const result = await directusSessionFetch<{ data: DirectoryUser[] }>(
    `/users?fields=${fields}&sort=first_name,last_name,email&limit=100`
  );

  return result.ok ? result.data.data : [];
}

export async function listRoles() {
  const result = await directusSessionFetch<{ data: DirectusRole[] }>(
    "/roles?fields=id,name,description,users&sort=name&limit=100"
  );

  return result.ok ? result.data.data : [];
}
