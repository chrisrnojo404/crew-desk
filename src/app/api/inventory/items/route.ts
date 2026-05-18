import { NextResponse } from "next/server";
import { z } from "zod";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { getSessionUser } from "@/features/auth/server/session";

const optionalId = z.string().uuid().or(z.literal("")).optional();

const createAssetSchema = z.object({
  asset_code: z.string().min(1),
  name: z.string().min(1),
  serial_number: z.string().optional(),
  barcode: z.string().optional(),
  category: optionalId,
  vendor: optionalId,
  location: optionalId,
  status: z.string().default("available"),
  purchase_date: z.string().optional(),
  warranty_expires_at: z.string().optional(),
  purchase_cost: z.string().optional(),
  current_value: z.string().optional()
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const payload = createAssetSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "Invalid asset payload." }, { status: 400 });
  }

  const data = payload.data;
  const result = await directusSessionFetch("/items/inventory_items", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      category: data.category || null,
      vendor: data.vendor || null,
      location: data.location || null,
      purchase_cost: data.purchase_cost ? Number(data.purchase_cost) : null,
      current_value: data.current_value ? Number(data.current_value) : null
    })
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message ?? "Unable to register asset." }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
