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
  { collection: "internal_notifications", icon: "notifications", note: "In-app and outbound notification records." },
  { collection: "automation_rules", icon: "settings_suggest", note: "Automation catalog for Directus Flows and future integrations." },
  { collection: "workflow_events", icon: "timeline", note: "Normalized workflow event log for approvals, notifications, and automations." }
];

const fields = {
  internal_notifications: [
    field("title", "string", { required: true }),
    field("message", "text"),
    field("module", "string"),
    field("event_type", "string"),
    field("priority", "string", { defaultValue: "normal" }),
    field("channel", "string", { defaultValue: "in_app" }),
    field("status", "string", { defaultValue: "unread" }),
    field("action_url", "string"),
    relationField("recipient", "uuid"),
    relationField("created_by", "uuid")
  ],
  automation_rules: [
    field("name", "string", { required: true, unique: true }),
    field("module", "string"),
    field("event_type", "string"),
    field("channel", "string", { defaultValue: "in_app" }),
    field("enabled", "boolean", { defaultValue: true }),
    field("description", "text"),
    field("template_subject", "string"),
    field("template_body", "text")
  ],
  workflow_events: [
    field("module", "string"),
    field("event_type", "string"),
    field("entity_collection", "string"),
    field("entity_id", "string"),
    field("status", "string", { defaultValue: "received" }),
    field("payload", "json")
  ]
};

const relations = [
  rel("internal_notifications", "recipient", "directus_users", "CASCADE"),
  rel("internal_notifications", "created_by", "directus_users", "SET NULL")
];

const rules = [
  ["Leave approval notification", "leave", "leave_request_submitted", "in_app", "Notify managers when an employee submits a leave request."],
  ["Leave HR confirmation", "leave", "leave_manager_approved", "email", "Notify HR when manager approval is complete."],
  ["Gear request notification", "gear_desk", "gear_request_submitted", "in_app", "Notify Gear Desk officers about new equipment requests."],
  ["Overdue equipment alert", "gear_desk", "gear_checkout_overdue", "email", "Alert Gear Desk officers and requesters when equipment is overdue."],
  ["Maintenance reminder", "inventory", "maintenance_due", "email", "Send reminders for scheduled maintenance and warranty dates."],
  ["Production assignment notification", "productions", "production_assignment_created", "in_app", "Notify employees assigned to a production or field activity."]
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
    item.type === "uuid" ? "uuid" : item.type === "boolean" ? "boolean" : item.type === "text" || item.type === "json" ? "text" : "varchar";
  return {
    name: item.name,
    data_type: dataType,
    is_nullable: !item.required,
    is_unique: Boolean(item.unique),
    max_length: dataType === "varchar" ? 255 : null,
    default_value: item.defaultValue ?? null
  };
}

function metaFor(item) {
  return {
    interface: item.relation ? "select-dropdown-m2o" : item.type === "text" || item.type === "json" ? "input-multiline" : item.type === "boolean" ? "boolean" : "input",
    special: item.relation ? ["m2o"] : item.type === "boolean" ? ["cast-boolean"] : item.type === "json" ? ["cast-json"] : null,
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

async function seedRule(token, name, module, eventType, channel, description) {
  const existing = await request(`/items/automation_rules?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (existing.data.length) return;
  await request("/items/automation_rules", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name,
      module,
      event_type: eventType,
      channel,
      enabled: true,
      description,
      template_subject: name,
      template_body: description
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
  for (const rule of rules) await seedRule(token, ...rule);

  const employeePolicy = await getPolicy(token, "Employee Policy");
  const managerPolicy = await getPolicy(token, "Manager Policy");
  const hrPolicy = await getPolicy(token, "HR Policy");

  if (employeePolicy) {
    await ensurePermission(token, employeePolicy.id, "internal_notifications", "read", { recipient: { _eq: "$CURRENT_USER" } });
    await ensurePermission(token, employeePolicy.id, "internal_notifications", "update", { recipient: { _eq: "$CURRENT_USER" } });
  }

  for (const policy of [managerPolicy, hrPolicy].filter(Boolean)) {
    for (const collection of ["internal_notifications", "automation_rules", "workflow_events"]) {
      await ensurePermission(token, policy.id, collection, "read");
    }
  }

  if (hrPolicy) {
    for (const collection of ["internal_notifications", "automation_rules", "workflow_events"]) {
      for (const action of ["create", "update", "delete"]) await ensurePermission(token, hrPolicy.id, collection, action);
    }
  }

  console.log("Phase 7 Directus notification collections, automation rules, and permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
