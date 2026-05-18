import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import type { DamageReport, GearCheckout, GearRequest, GearRequestItem } from "@/features/gear-desk/types";
import type { InventoryItem } from "@/features/inventory/types";

const requestFields = [
  "id",
  "request_code",
  "production_activity_type",
  "location",
  "request_date",
  "start_time",
  "end_time",
  "return_date",
  "notes",
  "status",
  "approval_notes",
  "requested_by.id",
  "requested_by.first_name",
  "requested_by.last_name",
  "requested_by.email",
  "reviewed_by.id",
  "reviewed_by.first_name",
  "reviewed_by.last_name",
  "reviewed_by.email",
  "date_created",
  "date_updated"
].join(",");

const requestItemFields = [
  "id",
  "quantity",
  "checkout_status",
  "notes",
  "request.id",
  "request.request_code",
  "request.status",
  "item.id",
  "item.asset_code",
  "item.name",
  "item.serial_number",
  "item.status",
  "item.category.name",
  "item.location.name"
].join(",");

export async function listGearRequests() {
  const result = await directusSessionFetch<{ data: GearRequest[] }>(
    `/items/gear_requests?fields=${requestFields}&sort=-date_created&limit=100`
  );

  return result.ok ? result.data.data : [];
}

export async function getGearRequest(id: string) {
  const result = await directusSessionFetch<{ data: GearRequest }>(`/items/gear_requests/${id}?fields=${requestFields}`);
  return result.ok ? result.data.data : null;
}

export async function listGearRequestItems(requestId?: string) {
  const filter = requestId ? `&filter[request][_eq]=${encodeURIComponent(requestId)}` : "";
  const result = await directusSessionFetch<{ data: GearRequestItem[] }>(
    `/items/gear_request_items?fields=${requestItemFields}${filter}&sort=id&limit=200`
  );

  return result.ok ? result.data.data : [];
}

export async function listAvailableGearItems() {
  const fields = [
    "id",
    "asset_code",
    "name",
    "serial_number",
    "status",
    "category.id",
    "category.name",
    "location.id",
    "location.name"
  ].join(",");
  const result = await directusSessionFetch<{ data: InventoryItem[] }>(
    `/items/inventory_items?fields=${fields}&filter[status][_eq]=available&sort=asset_code&limit=200`
  );

  return result.ok ? result.data.data : [];
}

export async function listGearCheckouts() {
  const result = await directusSessionFetch<{ data: GearCheckout[] }>(
    "/items/gear_checkouts?fields=id,checkout_code,status,checked_out_at,expected_return_at,returned_at,digital_signature,request.id,request.request_code,request.status&sort=-checked_out_at&limit=80"
  );

  return result.ok ? result.data.data : [];
}

export async function listDamageReports() {
  const result = await directusSessionFetch<{ data: DamageReport[] }>(
    "/items/damage_reports?fields=id,title,severity,status,description,item.id,item.asset_code,item.name,item.status,request.id,request.request_code,request.status&sort=-id&limit=50"
  );

  return result.ok ? result.data.data : [];
}
