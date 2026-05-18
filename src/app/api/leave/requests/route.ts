import { NextResponse } from "next/server";
import { z } from "zod";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { getSessionUser } from "@/features/auth/server/session";

const leaveRequestSchema = z.object({
  leave_type: z.number(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  total_days: z.number().min(1),
  reason: z.string().optional()
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const payload = leaveRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Invalid leave request payload." }, { status: 400 });
  }

  const requestCode = `LV-${Date.now().toString(36).toUpperCase()}`;
  const result = await directusSessionFetch("/items/leave_requests", {
    method: "POST",
    body: JSON.stringify({
      request_code: requestCode,
      leave_type: payload.data.leave_type,
      start_date: payload.data.start_date,
      end_date: payload.data.end_date,
      total_days: payload.data.total_days,
      reason: payload.data.reason,
      status: "pending",
      manager_status: "pending",
      hr_status: "pending",
      employee: sessionUser.id,
      manager: sessionUser.manager || null
    })
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message ?? "Unable to submit leave request." }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
