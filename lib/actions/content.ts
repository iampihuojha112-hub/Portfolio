"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getTable } from "@/lib/admin-config";
import { buildSchema, slugify, statusSchema } from "@/lib/validation/schemas";
import { BUCKET } from "@/lib/storage";
import { guard, userError, type ActionResult } from "./result";
import { revalidatePortfolio } from "./revalidate";
import { z } from "zod";

type Row = Record<string, unknown>;

function resolveTable(name: string) {
  const def = getTable(name);
  if (!def) throw userError("Unknown content type.");
  return def;
}

async function removeFiles(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], paths: Array<unknown>) {
  const list = paths.filter((p): p is string => typeof p === "string" && p.length > 0);
  if (list.length) await supabase.storage.from(BUCKET).remove(list);
}

export async function saveRow(table: string, id: string | null, values: unknown): Promise<ActionResult<{ id: string }>> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const def = resolveTable(table);
    const parsed = buildSchema(def).parse(values) as Row;

    if (table === "projects" && !parsed.slug) parsed.slug = slugify(String(parsed.title ?? "project"));
    if (table === "certifications") parsed.file_type = String(parsed.file_path).toLowerCase().endsWith(".pdf") ? "pdf" : "image";
    if (table === "education" && parsed.is_ongoing) parsed.end_date = null;

    if (id) {
      z.string().uuid().parse(id);
      const fileCols = def.fileFields.join(",");
      let oldFiles: Row | null = null;
      if (fileCols) {
        const { data } = await supabase.from(def.table).select(fileCols).eq("id", id).maybeSingle();
        oldFiles = (data as unknown as Row | null) ?? null;
      }
      const { error } = await supabase.from(def.table).update(parsed).eq("id", id);
      if (error) throw userError(friendlyDbError(error.message));
      if (oldFiles) {
        const replaced = def.fileFields.map((f) => oldFiles![f]).filter((old, i) => old && old !== parsed[def.fileFields[i]]);
        await removeFiles(supabase, replaced);
      }
      revalidatePortfolio();
      return { id };
    }

    let q = supabase.from(def.table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
    if (def.parentFk) q = q.eq(def.parentFk, parsed[def.parentFk] as string);
    const { data: last } = await q;
    const next = ((last?.[0] as { sort_order?: number } | undefined)?.sort_order ?? 0) + 1;
    const { data, error } = await supabase.from(def.table).insert({ ...parsed, sort_order: next }).select("id").single();
    if (error) throw userError(friendlyDbError(error.message));
    revalidatePortfolio();
    return { id: data.id as string };
  });
}

export async function deleteRow(table: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const def = resolveTable(table);
    z.string().uuid().parse(id);

    const files: unknown[] = [];
    if (def.fileFields.length) {
      const { data } = await supabase.from(def.table).select(def.fileFields.join(",")).eq("id", id).maybeSingle();
      if (data) def.fileFields.forEach((f) => files.push((data as unknown as Row)[f]));
    }
    for (const child of def.children ?? []) {
      const childDef = resolveTable(child.table);
      if (!childDef.fileFields.length) continue;
      const { data } = await supabase.from(child.table).select(childDef.fileFields.join(",")).eq(child.fk, id);
      (data as unknown as Row[] | null)?.forEach((r) => childDef.fileFields.forEach((f) => files.push(r[f])));
    }

    const { error } = await supabase.from(def.table).delete().eq("id", id);
    if (error) throw userError(friendlyDbError(error.message));
    await removeFiles(supabase, files);
    revalidatePortfolio();
  });
}

export async function setStatus(table: string, id: string, status: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const def = resolveTable(table);
    if (!def.hasStatus) throw userError("This content type has no publication status.");
    z.string().uuid().parse(id);
    const { error } = await supabase.from(def.table).update({ status: statusSchema.parse(status) }).eq("id", id);
    if (error) throw userError(friendlyDbError(error.message));
    revalidatePortfolio();
  });
}

export async function reorderRows(table: string, orderedIds: string[]): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const def = resolveTable(table);
    const ids = z.array(z.string().uuid()).max(500).parse(orderedIds);
    const results = await Promise.all(ids.map((rowId, i) => supabase.from(def.table).update({ sort_order: i + 1 }).eq("id", rowId)));
    const failed = results.find((r) => r.error);
    if (failed?.error) throw userError(friendlyDbError(failed.error.message));
    revalidatePortfolio();
  });
}

function friendlyDbError(msg: string): string {
  if (msg.includes("duplicate key")) return "That value already exists (check the slug or semester number).";
  if (msg.includes("violates check constraint")) return "One of the values is out of the allowed range or format.";
  if (msg.includes("row-level security")) return "You are not authorized to do that.";
  return "The database rejected this change.";
}
