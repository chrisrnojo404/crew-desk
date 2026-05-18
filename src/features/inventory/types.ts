export type InventoryStatus = "available" | "assigned" | "reserved" | "in_repair" | "damaged" | "lost" | "retired";

export type InventoryCategory = {
  id: number;
  name: string;
  slug?: string | null;
};

export type Vendor = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type Location = {
  id: number;
  name: string;
  code?: string | null;
};

export type InventoryItem = {
  id: string;
  asset_code: string;
  name: string;
  serial_number?: string | null;
  qr_code?: string | null;
  barcode?: string | null;
  status: InventoryStatus;
  condition?: string | null;
  purchase_date?: string | null;
  warranty_expires_at?: string | null;
  purchase_cost?: number | null;
  current_value?: number | null;
  notes?: string | null;
  category?: InventoryCategory | null;
  vendor?: Vendor | null;
  location?: Location | null;
  assigned_to?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  date_created?: string | null;
  date_updated?: string | null;
};

export type MaintenanceLog = {
  id: string;
  title: string;
  status: string;
  maintenance_type?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  cost?: number | null;
  item?: Pick<InventoryItem, "id" | "asset_code" | "name"> | null;
};
