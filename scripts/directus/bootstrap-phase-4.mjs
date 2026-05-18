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
  { collection: "gear_requests", icon: "assignment", note: "Equipment reservation requests submitted by employees." },
  { collection: "gear_request_items", icon: "checklist", note: "Requested inventory items attached to gear requests." },
  { collection: "gear_checkouts", icon: "assignment_turned_in", note: "Generated checkout records and return tracking." },
  { collection: "damage_reports", icon: "report_problem", note: "Damage reports created during checkout or return workflows." }
];

const fields = {
  gear_requests: [
    field("request_code", "string", { unique: true }),
    field("production_activity_type", "string", { required: true }),
    field("location", "string"),
    field("request_date", "date"),
    field("start_time", "time"),
    field("end_time", "time"),
    field("return_date", "date"),
    field("notes", "text"),
    field("status", "string", { defaultValue: "pending" }),
    field("approval_notes", "text"),
    relationField("requested_by", "uuid"),
    relationField("reviewed_by", "uuid")
  ],
  gear_request_items: [
    relationField("request", "integer"),
    relationField("item", "integer"),
    field("quantity", "integer", { defaultValue: 1 }),
    field("checkout_status", "string", { defaultValue: "requested" }),
    field("notes", "text")
  ],
  gear_checkouts: [
    field("checkout_code", "string", { unique: true }),
    relationField("request", "integer"),
    field("status", "string", { defaultValue: "open" }),
    field("checked_out_at", "dateTime"),
    field("expected_return_at", "dateTime"),
    field("returned_at", "dateTime"),
    field("digital_signature", "text"),
    field("notes", "text"),
    relationField("checked_out_by", "uuid"),
    relationField("returned_by", "uuid")
  ],
  damage_reports: [
    field("title", "string", { required: true }),
    field("severity", "string"),
    field("status", "string", { defaultValue: "open" }),
    field("description", "text"),
    relationField("request", "integer"),
    relationField("item", "integer"),
    relationField("reported_by", "uuid")
  ]
};

const relations = [
  rel("gear_requests", "requested_by", "directus_users", "SET NULL"),
  rel("gear_requests", "reviewed_by", "directus_users", "SET NULL"),
  rel("gear_request_items", "request", "gear_requests", "CASCADE"),
  rel("gear_request_items", "item", "inventory_items", "SET NULL"),
  rel("gear_checkouts", "request", "gear_requests", "CASCADE"),
  rel("gear_checkouts", "checked_out_by", "directus_users", "SET NULL"),
  rel("gear_checkouts", "returned_by", "directus_users", "SET NULL"),
  rel("damage_reports", "request", "gear_requests", "SET NULL"),
  rel("damage_reports", "item", "inventory_items", "SET NULL"),
  rel("damage_reports", "reported_by", "directus_users", "SET NULL")
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
            : item.type === "time"
              ? "time without time zone"
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
    body: JSON.stringify({
      field: item.name,
      type: item.type === "dateTime" ? "dateTime" : item.type,
      meta: metaFor(item),
      schema: schemaFor(item)
    })
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

  const gearCollections = ["gear_requests", "gear_request_items", "gear_checkouts", "damage_reports"];
  const gearPolicy = await getPolicy(token, "Gear Desk Officer Policy");
  const employeePolicy = await getPolicy(token, "Employee Policy");
  const managerPolicy = await getPolicy(token, "Manager Policy");

  if (gearPolicy) {
    for (const collection of gearCollections) {
      for (const action of ["read", "create", "update", "delete"]) await ensurePermission(token, gearPolicy.id, collection, action);
    }
  }

  if (employeePolicy) {
    await ensurePermission(token, employeePolicy.id, "gear_requests", "read", { requested_by: { _eq: "$CURRENT_USER" } });
    await ensurePermission(token, employeePolicy.id, "gear_requests", "create");
    await ensurePermission(token, employeePolicy.id, "gear_request_items", "read");
    await ensurePermission(token, employeePolicy.id, "gear_request_items", "create");
  }

  if (managerPolicy) {
    for (const collection of gearCollections) await ensurePermission(token, managerPolicy.id, collection, "read");
  }

  console.log("Phase 4 Directus gear desk collections, relations, and permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
