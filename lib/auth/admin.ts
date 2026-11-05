import { redirect } from "next/navigation";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export class AuthError extends Error {}

/**
 * Server-side authorization. getUser() re-validates the JWT with Supabase Auth (never trust
 * cookies alone), then is_admin() checks the confirmed-email allowlist in the database.
 */
export async function getAdminContext() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) return null;
  return { supabase, user };
}

/** For pages/layouts: redirect to login when not an authorized admin. */
export async function requireAdminPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

/** For server actions / route handlers: throw when not an authorized admin. */
export async function requireAdmin() {
  const ctx = await getAdminContext();
  if (!ctx) throw new AuthError("Not authorized");
  return ctx;
}
