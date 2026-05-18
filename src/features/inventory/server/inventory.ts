import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import type { InventoryCategory, InventoryItem, Location, MaintenanceLog, Vendor } from "@/features/inventory/types";

const itemFields = [
  "id",
  "asset_code",
  "name",
  "serial_number",
  "qr_code",
  "barcode",
  "status",
  "condition",
  "purchase_date",
  "warranty_expires_at",
  "purchase_cost",
  "current_value",
  "notes",
  "category.id",
  "category.name",
  "category.slug",
  "vendor.id",
  "vendor.name",
  "vendor.email",
  "vendor.phone",
  "location.id",
  "location.name",
  "location.code",
  "assigned_to.id",
  "assigned_to.first_name",
  "assigned_to.last_name",
  "assigned_to.email",
  "date_created",
  "date_updated"
].join(",");

export async function listInventoryItems() {
  const result = await directusSessionFetch<{ data: InventoryItem[] }>(
    `/items/inventory_items?fields=${itemFields}&sort=asset_code&limit=200`
  );

  return result.ok ? result.data.data : [];
}

export async function getInventoryItem(id: string) {
  const result = await directusSessionFetch<{ data: InventoryItem }>(`/items/inventory_items/${id}?fields=${itemFields}`);
  return result.ok ? result.data.data : null;
}

export async function listInventoryCategories() {
  const result = await directusSessionFetch<{ data: InventoryCategory[] }>(
    "/items/inventory_categories?fields=id,name,slug&sort=name&limit=100"
  );

  return result.ok ? result.data.data : [];
}

export async function listVendors() {
  const result = await directusSessionFetch<{ data: Vendor[] }>("/items/vendors?fields=id,name,email,phone&sort=name&limit=100");
  return result.ok ? result.data.data : [];
}

export async function listLocations() {
  const result = await directusSessionFetch<{ data: Location[] }>("/items/locations?fields=id,name,code&sort=name&limit=100");
  return result.ok ? result.data.data : [];
}

export async function listMaintenanceLogs() {
  const result = await directusSessionFetch<{ data: MaintenanceLog[] }>(
    "/items/maintenance_logs?fields=id,title,status,maintenance_type,scheduled_at,completed_at,cost,item.id,item.asset_code,item.name&sort=-scheduled_at&limit=50"
  );

  return result.ok ? result.data.data : [];
}
