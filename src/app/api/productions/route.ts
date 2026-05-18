import { NextResponse } from "next/server";
import { z } from "zod";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { getSessionUser } from "@/features/auth/server/session";

const productionSchema = z.object({
  title: z.string().min(1),
  production_type: z.string().min(1),
  location: z.string().optional(),
  status: z.string().default("planned"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

  const payload = productionSchema.safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ message: "Invalid production payload." }, { status: 400 });

  const productionCode = `PRD-${Date.now().toString(36).toUpperCase()}`;
  const result = await directusSessionFetch("/items/productions", {
    method: "POST",
    body: JSON.stringify({
      ...payload.data,
      production_code: productionCode,
      coordinator: sessionUser.id
    })
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message ?? "Unable to create production." }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
