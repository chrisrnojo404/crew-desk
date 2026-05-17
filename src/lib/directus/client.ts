import { createDirectus, rest } from "@directus/sdk";

export type DirectusSchema = Record<string, unknown>;

export const directus = createDirectus<DirectusSchema>(
  process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055"
).with(rest());
