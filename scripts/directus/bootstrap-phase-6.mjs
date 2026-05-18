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
  { collection: "productions", icon: "movie", note: "Production and field operation plans." },
  { collection: "production_assignments", icon: "groups", note: "Crew and employee assignments for productions." },
  { collection: "production_activities", icon: "event", note: "Scheduled production activities, calls, and field movements." },
  { collection: "production_assets", icon: "local_shipping", note: "Assigned gear, vehicles, and assets connected to productions." }
];

const fields = {
  productions: [
    field("production_code", "string", { unique: true }),
    field("title", "string", { required: true }),
    field("production_type", "string", { required: true }),
    field("status", "string", { defaultValue: "planned" }),
    field("location", "string"),
    field("start_date", "date"),
    field("end_date", "date"),
    field("notes", "text"),
    relationField("coordinator", "uuid"),
    relationField("gear_request", "integer")
  ],
  production_assignments: [
    relationField("production", "integer"),
    relationField("employee", "uuid"),
    field("role", "string"),
    field("status", "string", { defaultValue: "assigned" }),
    field("notes", "text")
  ],
  production_activities: [
    relationField("production", "integer"),
    field("title", "string", { required: true }),
    field("activity_type", "string"),
    field("starts_at", "dateTime"),
    field("ends_at", "dateTime"),
    field("location", "string"),
    field("status", "string", { defaultValue: "planned" }),
    field("notes", "text")
  ],
  production_assets: [
    relationField("production", "integer"),
    relationField("asset", "integer"),
    field("purpose", "string"),
    field("notes", "text")
  ]
};

const relations = [
  rel("productions", "coordinator", "directus_users", "SET NULL"),
  rel("productions", "gear_request", "gear_requests", "SET NULL"),
  rel("production_assignments", "production", "productions", "CASCADE"),
  rel("production_assignments", "employee", "directus_users", "SET NULL"),
  rel("production_activities", "production", "productions", "CASCADE"),
  rel("production_assets", "production", "productions", "CASCADE"),
  rel("production_assets", "asset", "inventory_items", "SET NULL")
];

function field(name, type, options = {}) {
  return { name, type, ...options };
}

function relationField(name, type) {
  return field(name, type, { relation: true });
}

function rel(collection, fieldName, relatedCollection, onDelete) {
  return { collection, field: fieldName, related_collection: relatedCollection, on_delete: onDelete };
}

function schemaFor(item) {
  const dataType =
    item.type === "uuid"
      ? "uuid"
      : item.type === "integer"
        ? "integer"
        : item.type === "text"
          ? "text"
          : item.type === "date"
            ? "date"
            : item.type === "dateTime"
              ? "timestamp with time zone"
              : "varchar";
  return {
    name: item.name,
    data_type: dataType,
    is_nullable: !item.required,
    is_unique: Boolean(item.unique),
    max_length: dataType === "varchar" ? 255 : null,
    numeric_precision: item.type === "integer" ? 32 : null,
    numeric_scale: item.type === "integer" ? 0 : null,
    default_value: item.defaultValue ?? null
  };
}

function metaFor(item) {
  return {
    interface: item.relation ? "select-dropdown-m2o" : item.type === "text" ? "input-multiline" : "input",
    special: item.relation ? ["m2o"] : null,
    width: item.type === "text" ? "full" : "half",
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

async function ensureRelation(token, item) {
  const existing = await request(`/relations/${item.collection}`, { headers: { Authorization: `Bearer ${token}` } });
  if (existing.data.some((relation) => relation.field === item.field)) return;
  await request("/relations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      collection: item.collection,
      field: item.field,
      related_collection: item.related_collection,
      meta: { many_collection: item.collection, many_field: item.field, one_collection: item.related_collection, one_field: null },
      schema: { on_delete: item.on_delete }
    })
  });
}

async function getPolicy(token, name) {
  const existing = await request(`/policies?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return existing.data[0] ?? null;
}

async function ensurePermission(token, policyId, collection, action, permissions = {}) {
  const existing = await request(
    `/permissions?filter[policy][_eq]=${encodeURIComponent(policyId)}&filter[collection][_eq]=${collection}&filter[action][_eq]=${action}&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (existing.data.length) return;
  await request("/permissions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ policy: policyId, collection, action, permissions, validation: {}, presets: {}, fields: ["*"] })
  });
}

async function main() {
  const token = await login();
  for (const collection of collections) await ensureCollection(token, collection);
  for (const [collection, collectionFields] of Object.entries(fields)) {
    for (const item of collectionFields) await ensureField(token, collection, item);
  }
  for (const relation of relations) await ensureRelation(token, relation);

  const productionPolicy = await getPolicy(token, "Production Coordinator Policy");
  const managerPolicy = await getPolicy(token, "Manager Policy");
  const employeePolicy = await getPolicy(token, "Employee Policy");
  const productionCollections = ["productions", "production_assignments", "production_activities", "production_assets"];

  if (productionPolicy) {
    for (const collection of productionCollections) {
      for (const action of ["read", "create", "update", "delete"]) await ensurePermission(token, productionPolicy.id, collection, action);
    }
  }
  if (managerPolicy) {
    for (const collection of productionCollections) await ensurePermission(token, managerPolicy.id, collection, "read");
  }
  if (employeePolicy) {
    for (const collection of ["productions", "production_assignments", "production_activities"]) {
      await ensurePermission(token, employeePolicy.id, collection, "read");
    }
  }

  console.log("Phase 6 Directus production collections, relations, and permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
