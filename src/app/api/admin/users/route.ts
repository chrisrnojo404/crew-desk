import { NextResponse } from "next/server";
import { z } from "zod";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { canManageUsers, getSessionUser } from "@/features/auth/server/session";

const createUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: z.string().uuid().optional(),
  employee_id: z.string().optional(),
  department: z.string().optional(),
  job_title: z.string().optional()
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!canManageUsers(sessionUser)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const payload = createUserSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Invalid user payload." }, { status: 400 });
  }

  const result = await directusSessionFetch("/users", {
    method: "POST",
    body: JSON.stringify({
      ...payload.data,
      status: "invited"
    })
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message ?? "Unable to create user." }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
