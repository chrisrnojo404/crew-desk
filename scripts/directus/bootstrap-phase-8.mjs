import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function readEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return {};
  return Object.fromEntries(
    readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...value] = line.split("=");
        return [key, value.join("=").replace(/^["']|["']$/g, "")];
      })
  );
}

const env = { ...readEnv(), ...process.env };
const directusUrl = env.DIRECTUS_PUBLIC_URL ?? env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";
const adminEmail = env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = env.DIRECTUS_ADMIN_PASSWORD ?? "change-me-now";

const collections = [
  { collection: "report_definitions", icon: "summarize", note: "Saved report catalog and metadata." },
  { collection: "kpi_snapshots", icon: "insights", note: "Point-in-time KPI values for dashboard history." }
];

const fields = {
  report_definitions: [
    field("name", "string", { required: true }),
    field("slug", "string", { unique: true }),
    field("module", "string"),
    field("description", "text"),
    field("enabled", "boolean", { defaultValue: true }),
    field("config", "json")
  ],
  kpi_snapshots: [
    field("metric_key", "string", { required: true }),
    field("metric_label", "string", { required: true }),
    field("module", "string"),
    field("value", "decimal", { defaultValue: 0 }),
    field("unit", "string"),
    field("captured_at", "dateTime"),
    field("metadata", "json")
  ]
};

const reports = [
  ["Leave Reports", "leave-reports", "leave", "Leave requests, balances, history, and approval cycle reporting."],
  ["Employee Activity Reports", "employee-activity-reports", "people", "Employee activity across requests, assignments, approvals, and notifications."],
  ["Equipment Utilization Reports", "equipment-utilization-reports", "inventory", "Inventory and gear utilization by asset, category, department, and status."],
  ["Overdue Equipment Reports", "overdue-equipment-reports", "gear_desk", "Open checkout records past expected return date."],
  ["Maintenance Reports", "maintenance-reports", "inventory", "Maintenance, repair, warranty, and cost reporting."],
  ["Inventory Valuation", "inventory-valuation", "inventory", "Asset purchase cost, current value, and depreciation reporting."],
  ["Production Activity Reports", "production-activity-reports", "productions", "Production counts, activity schedule, crew assignments, and gear linkage."]
];

const snapshots = [
  ["pending_approvals", "Pending Approvals", "operations", 0, "count"],
  ["inventory_value", "Inventory Value", "inventory", 0, "USD"],
  ["equipment_utilization", "Equipment Utilization", "inventory", 0, "%"],
  ["active_productions", "Active Productions", "productions", 0, "count"]
];

function field(name, type, options = {}) {
  return { name, type, ...options };
}

function schemaFor(item) {
  const dataType =
    item.type === "boolean"
      ? "boolean"
      : item.type === "text" || item.type === "json"
        ? "text"
        : item.type === "decimal"
          ? "numeric"
          : item.type === "dateTime"
            ? "timestamp with time zone"
            : "varchar";
  return {
    name: item.name,
    data_type: dataType,
    is_nullable: !item.required,
    is_unique: Boolean(item.unique),
    max_length: dataType === "varchar" ? 255 : null,
    numeric_precision: item.type === "decimal" ? 14 : null,
    numeric_scale: item.type === "decimal" ? 2 : null,
    default_value: item.defaultValue ?? null
  };
}

function metaFor(item) {
  return {
    interface: item.type === "text" || item.type === "json" ? "input-multiline" : item.type === "boolean" ? "boolean" : "input",
    special: item.type === "boolean" ? ["cast-boolean"] : item.type === "json" ? ["cast-json"] : item.type === "decimal" ? ["cast-float"] : null,
    width: item.type === "text" || item.type === "json" ? "full" : "half",
    required: Boolean(item.required)
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${directusUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.errors?.[0]?.message ?? payload?.message ?? response.statusText;
    throw new Error(`${options.method ?? "GET"} ${path} failed: ${message}`);
  }
  return payload;
}

async function login() {
  const payload = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: adminEmail, password: adminPassword, mode: "json" })
  });
  return payload.data.access_token;
}

async function ensureCollection(token, item) {
  const existing = await request("/collections", { headers: { Authorization: `Bearer ${token}` } });
  if (existing.data.some((collection) => collection.collection === item.collection)) return;
  await request("/collections", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ collection: item.collection, meta: { icon: item.icon, note: item.note }, schema: { name: item.collection } })
  });
}

async function ensureField(token, collection, item) {
  const existing = await request(`/fields/${collection}`, { headers: { Authorization: `Bearer ${token}` } });
  if (existing.data.some((fieldItem) => fieldItem.field === item.name)) return;
  await request(`/fields/${collection}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ field: item.name, type: item.type === "dateTime" ? "dateTime" : item.type, meta: metaFor(item), schema: schemaFor(item) })
  });
}

async function seedReport(token, name, slug, module, description) {
  const existing = await request(`/items/report_definitions?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (existing.data.length) return;
  await request("/items/report_definitions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, slug, module, description, enabled: true, config: {} })
  });
}

async function seedSnapshot(token, metric_key, metric_label, module, value, unit) {
  const existing = await request(`/items/kpi_snapshots?filter[metric_key][_eq]=${encodeURIComponent(metric_key)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (existing.data.length) return;
  await request("/items/kpi_snapshots", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ metric_key, metric_label, module, value, unit, captured_at: new Date().toISOString(), metadata: {} })
  });
}

async function getPolicy(token, name) {
  const existing = await request(`/policies?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return existing.data[0] ?? null;
}

async function ensurePermission(token, policyId, collection, action) {
  const existing = await request(
    `/permissions?filter[policy][_eq]=${encodeURIComponent(policyId)}&filter[collection][_eq]=${collection}&filter[action][_eq]=${action}&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (existing.data.length) return;
  await request("/permissions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ policy: policyId, collection, action, permissions: {}, validation: {}, presets: {}, fields: ["*"] })
  });
}

async function main() {
  const token = await login();
  for (const collection of collections) await ensureCollection(token, collection);
  for (const [collection, collectionFields] of Object.entries(fields)) {
    for (const item of collectionFields) await ensureField(token, collection, item);
  }
  for (const report of reports) await seedReport(token, ...report);
  for (const snapshot of snapshots) await seedSnapshot(token, ...snapshot);

  const managerPolicy = await getPolicy(token, "Manager Policy");
  const hrPolicy = await getPolicy(token, "HR Policy");
  const adminPolicy = await getPolicy(token, "Admin Policy");

  for (const policy of [managerPolicy, hrPolicy, adminPolicy].filter(Boolean)) {
    for (const collection of ["report_definitions", "kpi_snapshots"]) {
      await ensurePermission(token, policy.id, collection, "read");
    }
  }

  for (const policy of [hrPolicy, adminPolicy].filter(Boolean)) {
    for (const collection of ["report_definitions", "kpi_snapshots"]) {
      for (const action of ["create", "update", "delete"]) await ensurePermission(token, policy.id, collection, action);
    }
  }

  console.log("Phase 8 Directus report definitions, KPI snapshots, and permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
