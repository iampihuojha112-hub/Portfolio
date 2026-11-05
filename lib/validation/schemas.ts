import { z } from "zod";
import type { FieldDef, TableDef } from "@/lib/admin-config";
import { STORAGE_PATH_RE } from "@/lib/storage";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

function base(f: FieldDef): z.ZodTypeAny {
  switch (f.type) {
    case "text": return z.string().trim().max(f.max ?? 300);
    case "textarea": return z.string().trim().max(f.max ?? 6000);
    case "slug": return z.string().trim().toLowerCase().max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");
    case "url": {
      const re = f.allowMailto ? /^(https?:\/\/|mailto:)\S+$/i : /^https?:\/\/\S+$/i;
      return z.string().trim().max(500).regex(re, f.allowMailto ? "Must start with https:// or mailto:" : "Must start with http:// or https://");
    }
    case "date": return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
    case "number": {
      let n = z.coerce.number().finite();
      if (f.min !== undefined) n = n.min(f.min);
      if (f.max !== undefined) n = n.max(f.max);
      return n;
    }
    case "select": return z.enum((f.options ?? []).map((o) => o.value) as [string, ...string[]]);
    case "tags": return z.array(z.string().trim().min(1).max(200)).max(40);
    case "boolean": return z.boolean();
    case "file": return z.string().regex(STORAGE_PATH_RE, "Invalid file reference");
    case "relation": return z.string().uuid();
  }
}

function fieldSchema(f: FieldDef): z.ZodTypeAny {
  if (f.type === "boolean") return z.boolean().default(false);
  if (f.type === "tags") return z.array(z.string().trim().min(1).max(200)).max(40).default([]);
  const s = base(f);
  if (f.required) return z.preprocess(emptyToNull, s.refine(() => true));
  return z.preprocess(emptyToNull, s.nullable());
}

export function buildSchema(def: TableDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of def.fields) shape[f.name] = fieldSchema(f);
  if (def.hasStatus) shape.status = z.enum(["draft", "published", "archived"]).default("draft");
  if (def.parentFk) shape[def.parentFk] = z.string().uuid();
  return z.object(shape);
}

export const statusSchema = z.enum(["draft", "published", "archived"]);

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.preprocess(emptyToNull, z.string().trim().max(300).nullable()),
  intro: z.preprocess(emptyToNull, z.string().trim().max(2000).nullable()),
  about: z.preprocess(emptyToNull, z.string().trim().max(8000).nullable()),
  email: z.preprocess(emptyToNull, z.string().trim().email().max(254).nullable()),
  location: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  photo_path: z.preprocess(emptyToNull, z.string().regex(STORAGE_PATH_RE).nullable()),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(254),
  message: z.string().trim().min(10, "Message is a little short").max(4000),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export function slugify(input: string): string {
  return input.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "project";
}
