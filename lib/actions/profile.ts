"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { profileSchema } from "@/lib/validation/schemas";
import { BUCKET } from "@/lib/storage";
import { guard, userError, type ActionResult } from "./result";
import { revalidatePortfolio } from "./revalidate";

export async function saveProfile(values: unknown): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const parsed = profileSchema.parse(values);
    const { data: old } = await supabase.from("profiles").select("photo_path").eq("id", 1).maybeSingle();
    const { error } = await supabase.from("profiles").update(parsed).eq("id", 1);
    if (error) throw userError("Could not save the profile.");
    if (old?.photo_path && old.photo_path !== parsed.photo_path) await supabase.storage.from(BUCKET).remove([old.photo_path]);
    revalidatePortfolio();
  });
}
