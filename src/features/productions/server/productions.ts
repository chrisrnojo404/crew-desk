import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import type { Production, ProductionActivity, ProductionAsset, ProductionAssignment } from "@/features/productions/types";

const productionFields = [
  "id",
  "production_code",
  "title",
  "production_type",
  "status",
  "location",
  "start_date",
  "end_date",
  "notes",
  "gear_request.id",
  "gear_request.request_code",
  "gear_request.status",
  "coordinator.id",
  "coordinator.first_name",
  "coordinator.last_name",
  "coordinator.email",
  "date_created",
  "date_updated"
].join(",");

export async function listProductions() {
  const result = await directusSessionFetch<{ data: Production[] }>(
    `/items/productions?fields=${productionFields}&sort=-start_date,-date_created&limit=120`
  );
  return result.ok ? result.data.data : [];
}

export async function getProduction(id: string) {
  const result = await directusSessionFetch<{ data: Production }>(`/items/productions/${id}?fields=${productionFields}`);
  return result.ok ? result.data.data : null;
}

export async function listProductionAssignments(productionId?: string) {
  const filter = productionId ? `&filter[production][_eq]=${encodeURIComponent(productionId)}` : "";
  const result = await directusSessionFetch<{ data: ProductionAssignment[] }>(
    `/items/production_assignments?fields=id,role,status,notes,production.id,production.production_code,production.title,production.status,employee.id,employee.first_name,employee.last_name,employee.email${filter}&sort=id&limit=200`
  );
  return result.ok ? result.data.data : [];
}

export async function listProductionActivities(productionId?: string) {
  const filter = productionId ? `&filter[production][_eq]=${encodeURIComponent(productionId)}` : "";
  const result = await directusSessionFetch<{ data: ProductionActivity[] }>(
    `/items/production_activities?fields=id,title,activity_type,starts_at,ends_at,location,status,production.id,production.production_code,production.title,production.status${filter}&sort=starts_at&limit=200`
  );
  return result.ok ? result.data.data : [];
}

export async function listProductionAssets(productionId?: string) {
  const filter = productionId ? `&filter[production][_eq]=${encodeURIComponent(productionId)}` : "";
  const result = await directusSessionFetch<{ data: ProductionAsset[] }>(
    `/items/production_assets?fields=id,purpose,production.id,production.production_code,production.title,production.status,asset.id,asset.asset_code,asset.name,asset.status,asset.category.name${filter}&sort=id&limit=200`
  );
  return result.ok ? result.data.data : [];
}
