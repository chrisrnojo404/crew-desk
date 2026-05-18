import type { GearRequest } from "@/features/gear-desk/types";
import type { InventoryItem } from "@/features/inventory/types";

export type ProductionStatus = "planned" | "approved" | "active" | "completed" | "cancelled";

export type Production = {
  id: number;
  production_code?: string | null;
  title: string;
  production_type: string;
  status: ProductionStatus;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  gear_request?: Pick<GearRequest, "id" | "request_code" | "status"> | null;
  coordinator?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  date_created?: string | null;
  date_updated?: string | null;
};

export type ProductionAssignment = {
  id: number;
  role?: string | null;
  status?: string | null;
  notes?: string | null;
  production?: Pick<Production, "id" | "production_code" | "title" | "status"> | null;
  employee?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
};

export type ProductionActivity = {
  id: number;
  title: string;
  activity_type?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  location?: string | null;
  status?: string | null;
  production?: Pick<Production, "id" | "production_code" | "title" | "status"> | null;
};

export type ProductionAsset = {
  id: number;
  purpose?: string | null;
  production?: Pick<Production, "id" | "production_code" | "title" | "status"> | null;
  asset?: InventoryItem | null;
};
