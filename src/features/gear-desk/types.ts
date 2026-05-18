import type { InventoryItem } from "@/features/inventory/types";

export type GearRequestStatus = "draft" | "pending" | "approved" | "rejected" | "checked_out" | "returned" | "cancelled";

export type GearRequest = {
  id: number;
  request_code?: string | null;
  production_activity_type: string;
  location?: string | null;
  request_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  return_date?: string | null;
  notes?: string | null;
  status: GearRequestStatus;
  approval_notes?: string | null;
  requested_by?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  reviewed_by?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  date_created?: string | null;
  date_updated?: string | null;
};

export type GearRequestItem = {
  id: number;
  quantity: number;
  checkout_status?: string | null;
  notes?: string | null;
  request?: Pick<GearRequest, "id" | "request_code" | "status"> | null;
  item?: InventoryItem | null;
};

export type GearCheckout = {
  id: number;
  checkout_code?: string | null;
  status: string;
  checked_out_at?: string | null;
  expected_return_at?: string | null;
  returned_at?: string | null;
  digital_signature?: string | null;
  request?: GearRequest | null;
};

export type DamageReport = {
  id: number;
  title: string;
  severity?: string | null;
  status: string;
  description?: string | null;
  item?: Pick<InventoryItem, "id" | "asset_code" | "name" | "status"> | null;
  request?: Pick<GearRequest, "id" | "request_code" | "status"> | null;
};
