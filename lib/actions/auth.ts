"use server";

import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/schemas";

export interface LoginState { error?: string }

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasSupabaseEnv()) return { error: "Supabase is not configured yet. See the README." };
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid email or password." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    // Same message as a bad password: do not reveal which accounts exist.
    return { error: "Invalid email or password." };
  }
  redirect("/admin");
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
