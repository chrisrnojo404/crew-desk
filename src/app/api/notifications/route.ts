import { NextResponse } from "next/server";
import { z } from "zod";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { getSessionUser } from "@/features/auth/server/session";

const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().optional(),
  module: z.string().optional(),
  event_type: z.string().optional(),
  priority: z.string().default("normal"),
  channel: z.string().default("in_app"),
  recipient: z.string().uuid().optional(),
  action_url: z.string().optional()
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

  const payload = notificationSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ message: "Invalid notification payload." }, { status: 400 });

  const result = await directusSessionFetch("/items/internal_notifications", {
    method: "POST",
    body: JSON.stringify({
      ...payload.data,
      recipient: payload.data.recipient ?? sessionUser.id,
      created_by: sessionUser.id,
      status: "unread"
    })
  });

  if (!result.ok) return NextResponse.json({ message: result.message ?? "Unable to create notification." }, { status: result.status });
  return NextResponse.json({ ok: true }, { status: 201 });
}
