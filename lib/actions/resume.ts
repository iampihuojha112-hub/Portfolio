"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { BUCKET, STORAGE_PATH_RE } from "@/lib/storage";
import { guard, userError, type ActionResult } from "./result";
import { revalidatePortfolio } from "./revalidate";

const idSchema = z.string().uuid();

/** Register an already-uploaded PDF as a (draft) resume. */
export async function addResume(path: string, label: string | null): Promise<ActionResult<{ id: string }>> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    if (!STORAGE_PATH_RE.test(path) || !path.startsWith("resume/") || !path.endsWith(".pdf")) throw userError("Invalid resume file.");
    const { data, error } = await supabase.from("resumes")
      .insert({ file_path: path, label: label?.trim().slice(0, 120) || null, status: "draft" }).select("id").single();
    if (error) throw userError("Could not save the resume.");
    revalidatePortfolio();
    return { id: data.id as string };
  });
}

/** Make this resume the one the public "Download Resume" button serves. Replaces the previous one. */
export async function publishResume(id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("publish_resume", { p_id: idSchema.parse(id) });
    if (error) throw userError("Could not publish the resume.");
    revalidatePortfolio();
  });
}

export async function unpublishResume(id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("resumes").update({ is_current: false, status: "draft" }).eq("id", idSchema.parse(id));
    if (error) throw userError("Could not unpublish the resume.");
    revalidatePortfolio();
  });
}

export async function deleteResume(id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const rid = idSchema.parse(id);
    const { data } = await supabase.from("resumes").select("file_path").eq("id", rid).maybeSingle();
    const { error } = await supabase.from("resumes").delete().eq("id", rid);
    if (error) throw userError("Could not delete the resume.");
    if (data?.file_path) await supabase.storage.from(BUCKET).remove([data.file_path]);
    revalidatePortfolio();
  });
}
