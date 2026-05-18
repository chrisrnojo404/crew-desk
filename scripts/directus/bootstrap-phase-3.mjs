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
  { collection: "inventory_categories", icon: "category", note: "Asset categories such as cameras, laptops, vehicles, and accessories." },
  { collection: "vendors", icon: "storefront", note: "Suppliers, service providers, and warranty contacts." },
  { collection: "locations", icon: "location_on", note: "Warehouses, offices, studios, field hubs, and storage areas." },
  { collection: "inventory_items", icon: "inventory_2", note: "Trackable inventory assets and equipment." },
  { collection: "maintenance_logs", icon: "construction", note: "Asset service, repair, warranty, and inspection records." }
];

const fields = {
  inventory_categories: [
    field("name", "string", { required: true }),
    field("slug", "string"),
    field("description", "text"),
    field("status", "string", { defaultValue: "active" })
  ],
  vendors: [
    field("name", "string", { required: true }),
    field("email", "string"),
    field("phone", "string"),
    field("website", "string"),
    field("address", "text"),
    field("status", "string", { defaultValue: "active" })
  ],
  locations: [
    field("name", "string", { required: true }),
    field("code", "string"),
    field("address", "text"),
    field("status", "string", { defaultValue: "active" })
  ],
  inventory_items: [
    field("asset_code", "string", { required: true, unique: true }),
    field("name", "string", { required: true }),
    field("serial_number", "string"),
    field("qr_code", "string"),
    field("barcode", "string"),
    field("status", "string", { defaultValue: "available" }),
    field("condition", "string", { defaultValue: "good" }),
    field("purchase_date", "date"),
    field("warranty_expires_at", "date"),
    field("purchase_cost", "decimal"),
    field("current_value", "decimal"),
    field("depreciation_rate", "decimal"),
    field("notes", "text"),
    relationField("category", "integer"),
    relationField("vendor", "integer"),
    relationField("location", "integer"),
    relationField("assigned_to", "uuid")
  ],
  maintenance_logs: [
    field("title", "string", { required: true }),
    field("maintenance_type", "string"),
    field("status", "string", { defaultValue: "scheduled" }),
    field("scheduled_at", "dateTime"),
    field("completed_at", "dateTime"),
    field("cost", "decimal"),
    field("notes", "text"),
    relationField("item", "integer"),
    relationField("vendor", "integer")
  ]
};

const relations = [
  rel("inventory_items", "category", "inventory_categories", "SET NULL"),
  rel("inventory_items", "vendor", "vendors", "SET NULL"),
  rel("inventory_items", "location", "locations", "SET NULL"),
  rel("inventory_items", "assigned_to", "directus_users", "SET NULL"),
  rel("maintenance_logs", "item", "inventory_items", "CASCADE"),
  rel("maintenance_logs", "vendor", "vendors", "SET NULL")
];

const seedCategories = [
  ["Cameras", "cameras"],
  ["Laptops", "laptops"],
  ["Microphones", "microphones"],
  ["Lighting", "lighting"],
  ["Networking", "networking"],
  ["Office Equipment", "office-equipment"],
  ["Vehicles", "vehicles"],
  ["Accessories", "accessories"]
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
            : item.type === "decimal"
              ? "numeric"
              : "varchar";

  return {
    name: item.name,
    data_type: dataType,
    is_nullable: !item.required,
    is_unique: Boolean(item.unique),
    max_length: dataType === "varchar" ? 255 : null,
    numeric_precision: item.type === "decimal" ? 12 : item.type === "integer" ? 32 : null,
    numeric_scale: item.type === "decimal" ? 2 : null,
    default_value: item.defaultValue ?? null
  };
}

function metaFor(item) {
  const special = item.relation ? ["m2o"] : item.type === "decimal" ? ["cast-float"] : null;
  const interfaceName = item.relation ? "select-dropdown-m2o" : item.type === "text" ? "input-multiline" : "input";

  return {
    interface: interfaceName,
    special,
    width: item.type === "text" ? "full" : "half",
    required: Boolean(item.required)
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${directusUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
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
    body: JSON.stringify({
      collection: item.collection,
      meta: { icon: item.icon, note: item.note },
      schema: { name: item.collection }
    })
  });
}

async function ensureField(token, collection, item) {
  const existing = await request(`/fields/${collection}`, { headers: { Authorization: `Bearer ${token}` } });
  const existingField = existing.data.find((fieldItem) => fieldItem.field === item.name);

  if (existingField) {
    if (!item.relation || existingField.type === item.type) return;

    await request(`/fields/${collection}/${item.name}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
  }

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
      meta: {
        many_collection: item.collection,
        many_field: item.field,
        one_collection: item.related_collection,
        one_field: null
      },
      schema: {
        on_delete: item.on_delete
      }
    })
  });
}

async function ensurePolicy(token, name) {
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
    body: JSON.stringify({
      policy: policyId,
      collection,
      action,
      permissions,
      validation: {},
      presets: {},
      fields: ["*"]
    })
  });
}

async function seedCategory(token, name, slug) {
  const existing = await request(`/items/inventory_categories?filter[slug][_eq]=${slug}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (existing.data.length) return;

  await request("/items/inventory_categories", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, slug, status: "active" })
  });
}

async function main() {
  const token = await login();

  for (const collection of collections) await ensureCollection(token, collection);

  for (const [collection, collectionFields] of Object.entries(fields)) {
    for (const item of collectionFields) await ensureField(token, collection, item);
  }

  for (const relation of relations) await ensureRelation(token, relation);
  for (const [name, slug] of seedCategories) await seedCategory(token, name, slug);

  const collectionsForAccess = ["inventory_categories", "inventory_items", "vendors", "locations", "maintenance_logs"];
  const inventoryPolicy = await ensurePolicy(token, "Inventory Officer Policy");
  const managerPolicy = await ensurePolicy(token, "Manager Policy");
  const gearPolicy = await ensurePolicy(token, "Gear Desk Officer Policy");
  const employeePolicy = await ensurePolicy(token, "Employee Policy");

  if (inventoryPolicy) {
    for (const collection of collectionsForAccess) {
      for (const action of ["read", "create", "update", "delete"]) {
        await ensurePermission(token, inventoryPolicy.id, collection, action);
      }
    }
  }

  for (const policy of [managerPolicy, gearPolicy, employeePolicy].filter(Boolean)) {
    for (const collection of ["inventory_categories", "inventory_items", "locations"]) {
      await ensurePermission(token, policy.id, collection, "read");
    }
  }

  console.log("Phase 3 Directus inventory collections, relations, seed categories, and permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
