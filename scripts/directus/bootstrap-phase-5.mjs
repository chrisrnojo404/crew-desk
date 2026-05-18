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
  { collection: "leave_types", icon: "event_available", note: "Leave categories and annual allowance defaults." },
  { collection: "leave_requests", icon: "event_note", note: "Employee leave submissions and approval workflow state." },
  { collection: "leave_balances", icon: "account_balance_wallet", note: "Annual leave entitlement, used, pending, and remaining balances." }
];

const fields = {
  leave_types: [
    field("name", "string", { required: true }),
    field("slug", "string", { unique: true }),
    field("annual_allowance", "integer", { defaultValue: 0 }),
    field("requires_attachment", "boolean", { defaultValue: false }),
    field("status", "string", { defaultValue: "active" }),
    field("description", "text")
  ],
  leave_requests: [
    field("request_code", "string", { unique: true }),
    relationField("employee", "uuid"),
    relationField("leave_type", "integer"),
    field("start_date", "date", { required: true }),
    field("end_date", "date", { required: true }),
    field("total_days", "decimal", { defaultValue: 0 }),
    field("reason", "text"),
    field("status", "string", { defaultValue: "pending" }),
    relationField("manager", "uuid"),
    field("manager_status", "string", { defaultValue: "pending" }),
    relationField("hr_reviewer", "uuid"),
    field("hr_status", "string", { defaultValue: "pending" }),
    field("approval_notes", "text")
  ],
  leave_balances: [
    relationField("employee", "uuid"),
    relationField("leave_type", "integer"),
    field("year", "integer", { required: true }),
    field("entitlement", "decimal", { defaultValue: 0 }),
    field("used", "decimal", { defaultValue: 0 }),
    field("pending", "decimal", { defaultValue: 0 }),
    field("remaining", "decimal", { defaultValue: 0 })
  ]
};

const relations = [
  rel("leave_requests", "employee", "directus_users", "CASCADE"),
  rel("leave_requests", "leave_type", "leave_types", "SET NULL"),
  rel("leave_requests", "manager", "directus_users", "SET NULL"),
  rel("leave_requests", "hr_reviewer", "directus_users", "SET NULL"),
  rel("leave_balances", "employee", "directus_users", "CASCADE"),
  rel("leave_balances", "leave_type", "leave_types", "CASCADE")
];

const seedLeaveTypes = [
  ["Vacation", "vacation", 20, false],
  ["Sick Leave", "sick-leave", 10, true],
  ["Emergency Leave", "emergency-leave", 5, false],
  ["Unpaid Leave", "unpaid-leave", 0, false],
  ["Maternity Leave", "maternity-leave", 90, true]
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
        : item.type === "boolean"
          ? "boolean"
          : item.type === "text"
            ? "text"
            : item.type === "date"
              ? "date"
              : item.type === "decimal"
                ? "numeric"
                : "varchar";

  return {
    name: item.name,
    data_type: dataType,
    is_nullable: !item.required,
    is_unique: Boolean(item.unique),
    max_length: dataType === "varchar" ? 255 : null,
    numeric_precision: item.type === "decimal" ? 10 : item.type === "integer" ? 32 : null,
    numeric_scale: item.type === "decimal" ? 2 : item.type === "integer" ? 0 : null,
    default_value: item.defaultValue ?? null
  };
}

function metaFor(item) {
  return {
    interface: item.relation ? "select-dropdown-m2o" : item.type === "text" ? "input-multiline" : item.type === "boolean" ? "boolean" : "input",
    special: item.relation ? ["m2o"] : item.type === "boolean" ? ["cast-boolean"] : item.type === "decimal" ? ["cast-float"] : null,
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
    body: JSON.stringify({ field: item.name, type: item.type, meta: metaFor(item), schema: schemaFor(item) })
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

async function seedLeaveType(token, name, slug, annualAllowance, requiresAttachment) {
  const existing = await request(`/items/leave_types?filter[slug][_eq]=${slug}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (existing.data.length) return;
  await request("/items/leave_types", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, slug, annual_allowance: annualAllowance, requires_attachment: requiresAttachment, status: "active" })
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
  for (const args of seedLeaveTypes) await seedLeaveType(token, ...args);

  const employeePolicy = await getPolicy(token, "Employee Policy");
  const managerPolicy = await getPolicy(token, "Manager Policy");
  const hrPolicy = await getPolicy(token, "HR Policy");
  const leaveCollections = ["leave_types", "leave_requests", "leave_balances"];

  if (employeePolicy) {
    await ensurePermission(token, employeePolicy.id, "leave_types", "read");
    await ensurePermission(token, employeePolicy.id, "leave_requests", "read", { employee: { _eq: "$CURRENT_USER" } });
    await ensurePermission(token, employeePolicy.id, "leave_requests", "create");
    await ensurePermission(token, employeePolicy.id, "leave_balances", "read", { employee: { _eq: "$CURRENT_USER" } });
  }

  if (managerPolicy) {
    for (const collection of leaveCollections) await ensurePermission(token, managerPolicy.id, collection, "read");
    await ensurePermission(token, managerPolicy.id, "leave_requests", "update");
  }

  if (hrPolicy) {
    for (const collection of leaveCollections) {
      for (const action of ["read", "create", "update", "delete"]) await ensurePermission(token, hrPolicy.id, collection, action);
    }
  }

  console.log("Phase 5 Directus leave collections, seed types, relations, and permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
