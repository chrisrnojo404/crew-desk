import { NextResponse } from "next/server";
import { z } from "zod";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { getSessionUser } from "@/features/auth/server/session";

const gearRequestSchema = z.object({
  production_activity_type: z.string().min(1),
  location: z.string().min(1),
  request_date: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  return_date: z.string().min(1),
  notes: z.string().optional(),
  requested_items: z.array(z.object({ item: z.number(), quantity: z.number().min(1).default(1) })).min(1)
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const payload = gearRequestSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Invalid gear request payload." }, { status: 400 });
  }

  const requestCode = `GR-${Date.now().toString(36).toUpperCase()}`;
  const requestResult = await directusSessionFetch<{ data: { id: number } }>("/items/gear_requests", {
    method: "POST",
    body: JSON.stringify({
      request_code: requestCode,
      production_activity_type: payload.data.production_activity_type,
      location: payload.data.location,
      request_date: payload.data.request_date,
      start_time: payload.data.start_time,
      end_time: payload.data.end_time,
      return_date: payload.data.return_date,
      notes: payload.data.notes,
      status: "pending",
      requested_by: sessionUser.id
    })
  });

  if (!requestResult.ok) {
    return NextResponse.json({ message: requestResult.message ?? "Unable to create gear request." }, { status: requestResult.status });
  }

  for (const item of payload.data.requested_items) {
    const itemResult = await directusSessionFetch("/items/gear_request_items", {
      method: "POST",
      body: JSON.stringify({
        request: requestResult.data.data.id,
        item: item.item,
        quantity: item.quantity,
        checkout_status: "requested"
      })
    });

    if (!itemResult.ok) {
      return NextResponse.json({ message: itemResult.message ?? "Unable to attach requested items." }, { status: itemResult.status });
    }
  }

  return NextResponse.json({ ok: true, id: requestResult.data.data.id }, { status: 201 });
}
