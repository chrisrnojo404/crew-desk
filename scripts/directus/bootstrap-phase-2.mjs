import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function readEnv() {
  const envPath = resolve(root, ".env");

  if (!existsSync(envPath)) {
    return {};
  }

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

if (!adminEmail || !adminPassword) {
  throw new Error("DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD are required.");
}

const roles = [
  { name: "Employee", description: "Standard employee access for self-service requests and profile data." },
  { name: "Manager", description: "Team visibility, approval queues, and operational review access." },
  { name: "HR", description: "People operations, leave administration, and employee directory management." },
  { name: "Gear Desk Officer", description: "Equipment reservation, checkout, return, and damage intake access." },
  { name: "Inventory Officer", description: "Inventory catalog, asset lifecycle, and maintenance management access." },
  { name: "Production Coordinator", description: "Production planning, crew assignment, and activity scheduling access." },
  { name: "Admin", description: "Platform administration, permissions, settings, and audit access.", admin_access: true }
];

const userFields = [
  { field: "employee_id", type: "string", name: "Employee ID" },
  { field: "phone_number", type: "string", name: "Phone Number" },
  { field: "department", type: "string", name: "Department" },
  { field: "job_title", type: "string", name: "Job Title" },
  { field: "manager", type: "uuid", name: "Manager" }
];

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

async function ensureRole(token, role) {
  const existing = await request(`/roles?filter[name][_eq]=${encodeURIComponent(role.name)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (existing.data.length) {
    return existing.data[0];
  }

  const created = await request("/roles", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: role.name,
      description: role.description,
      icon: role.admin_access ? "admin_panel_settings" : "badge"
    })
  });

  return created.data;
}

async function ensurePolicy(token, role) {
  const policyName = `${role.name} Policy`;
  const existing = await request(`/policies?filter[name][_eq]=${encodeURIComponent(policyName)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (existing.data.length) {
    return existing.data[0];
  }

  const created = await request("/policies", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: policyName,
      description: role.description,
      icon: role.admin_access ? "admin_panel_settings" : "badge",
      admin_access: Boolean(role.admin_access),
      app_access: true,
      enforce_tfa: false
    })
  });

  return created.data;
}

async function ensureRoleAccess(token, role, policy) {
  const existing = await request(
    `/access?filter[role][_eq]=${encodeURIComponent(role.id)}&filter[policy][_eq]=${encodeURIComponent(policy.id)}&limit=1`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (existing.data.length) {
    return existing.data[0];
  }

  const created = await request("/access", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      role: role.id,
      policy: policy.id
    })
  });

  return created.data;
}

async function ensureCollection(token, collection, payload) {
  const collections = await request("/collections", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (collections.data.some((item) => item.collection === collection)) {
    return;
  }

  await request("/collections", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

async function ensureField(token, collection, field) {
  const fields = await request(`/fields/${collection}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (fields.data.some((item) => item.field === field.field)) {
    return;
  }

  await request(`/fields/${collection}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      field: field.field,
      type: field.type,
      meta: {
        interface: field.type === "uuid" ? "select-dropdown-m2o" : "input",
        special: field.type === "uuid" ? ["m2o"] : null,
        options: field.type === "uuid" ? { template: "{{first_name}} {{last_name}} - {{email}}" } : null,
        width: "half",
        note: field.name
      },
      schema: {
        name: field.field,
        data_type: field.type === "uuid" ? "uuid" : "varchar",
        is_nullable: true,
        max_length: field.type === "uuid" ? null : 255
      }
    })
  });
}

async function ensureRelation(token) {
  const relations = await request("/relations/directus_users", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (relations.data.some((item) => item.field === "manager")) {
    return;
  }

  await request("/relations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      collection: "directus_users",
      field: "manager",
      related_collection: "directus_users",
      meta: {
        many_collection: "directus_users",
        many_field: "manager",
        one_collection: "directus_users",
        one_field: null
      },
      schema: {
        on_delete: "SET NULL"
      }
    })
  });
}

async function ensureDepartmentModel(token) {
  await ensureCollection(token, "departments", {
    collection: "departments",
    meta: {
      icon: "corporate_fare",
      note: "Company departments used for user profile and reporting segmentation."
    },
    schema: {
      name: "departments"
    }
  });

  for (const field of [
    { field: "name", type: "string", name: "Name", required: true },
    { field: "code", type: "string", name: "Code" },
    { field: "description", type: "text", name: "Description" },
    { field: "status", type: "string", name: "Status" }
  ]) {
    await ensureField(token, "departments", field);
  }
}

async function ensureBaselinePermissions(token, policyMap) {
  const employeePolicy = policyMap.get("Employee");
  const managerPolicy = policyMap.get("Manager");
  const hrPolicy = policyMap.get("HR");

  const rules = [
    { policy: employeePolicy?.id, collection: "directus_users", action: "read", permissions: { id: { _eq: "$CURRENT_USER" } } },
    { policy: employeePolicy?.id, collection: "directus_users", action: "update", permissions: { id: { _eq: "$CURRENT_USER" } } },
    { policy: managerPolicy?.id, collection: "directus_users", action: "read", permissions: {} },
    { policy: hrPolicy?.id, collection: "directus_users", action: "read", permissions: {} },
    { policy: hrPolicy?.id, collection: "directus_users", action: "create", permissions: {} },
    { policy: hrPolicy?.id, collection: "directus_users", action: "update", permissions: {} },
    { policy: hrPolicy?.id, collection: "directus_roles", action: "read", permissions: {} }
  ].filter((rule) => rule.policy);

  const existing = await request("/permissions?limit=-1", {
    headers: { Authorization: `Bearer ${token}` }
  });

  for (const rule of rules) {
    const exists = existing.data.some(
      (item) => item.policy === rule.policy && item.collection === rule.collection && item.action === rule.action
    );

    if (exists) {
      continue;
    }

    await request("/permissions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...rule,
        fields: ["*"],
        validation: {},
        presets: {}
      })
    });
  }
}

async function main() {
  const token = await login();
  const policyMap = new Map();

  for (const role of roles) {
    const savedRole = await ensureRole(token, role);
    const savedPolicy = await ensurePolicy(token, role);
    await ensureRoleAccess(token, savedRole, savedPolicy);
    policyMap.set(role.name, savedPolicy);
  }

  await ensureDepartmentModel(token);

  for (const field of userFields) {
    await ensureField(token, "directus_users", field);
  }

  await ensureRelation(token);
  await ensureBaselinePermissions(token, policyMap);

  console.log("Phase 2 Directus roles, profile fields, departments, and baseline permissions are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
