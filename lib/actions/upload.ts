"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { BUCKET, MIME_EXT, STORAGE_PATH_RE, UPLOAD_RULES, type UploadKind } from "@/lib/storage";
import { guard, userError, type ActionResult } from "./result";

const ticketSchema = z.object({
  kind: z.enum(Object.keys(UPLOAD_RULES) as [UploadKind, ...UploadKind[]]),
  mime: z.string().max(100),
  size: z.number().int().positive(),
});

export interface UploadTicket { path: string; signedUrl: string; token: string }

/**
 * Step 1 of an upload: the server (admin only) validates type and size, picks a random safe file name
 * and returns a one-time signed upload URL. The browser then uploads straight to Storage, which
 * avoids Vercel's request body limit and lets us show real progress.
 */
export async function createUploadTicket(input: unknown): Promise<ActionResult<UploadTicket>> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { kind, mime, size } = ticketSchema.parse(input);
    const rule = UPLOAD_RULES[kind];
    if (!rule.mimes.includes(mime)) throw userError(`Unsupported file type. Allowed: ${rule.mimes.map((m) => MIME_EXT[m]).join(", ")}.`);
    if (size > rule.maxBytes) throw userError(`File is too large (max ${Math.round(rule.maxBytes / 1024 / 1024)} MB).`);
    const path = `${rule.folder}/${randomUUID()}.${MIME_EXT[mime]}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw userError("Could not start the upload. Is the storage bucket set up?");
    return { path, signedUrl: data.signedUrl, token: data.token };
  });
}

/** Remove a file that was uploaded but never attached to a record (e.g. the form was cancelled). */
export async function discardUpload(path: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!STORAGE_PATH_RE.test(path)) throw userError("Invalid file reference.");
    const referenced = await isReferenced(supabase, path);
    if (referenced) return;
    await supabase.storage.from(BUCKET).remove([path]);
  });
}

async function isReferenced(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], path: string) {
  const checks: Array<[string, string]> = [
    ["profiles", "photo_path"], ["projects", "thumbnail_path"], ["project_images", "path"],
    ["hackathon_certificates", "path"], ["hackathon_images", "path"], ["certifications", "file_path"],
    ["interests", "image_path"], ["resumes", "file_path"],
  ];
  for (const [table, col] of checks) {
    const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(col, path);
    if (count) return true;
  }
  return false;
}
