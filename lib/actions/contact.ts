"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { contactSchema } from "@/lib/validation/schemas";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export interface ContactState { ok: boolean; error?: string; fieldErrors?: Record<string, string> }

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Spam traps: a hidden field real users never fill, and a minimum time-on-form.
  if (String(formData.get("website") ?? "") !== "") return { ok: true };
  const opened = Number(formData.get("opened_at"));
  if (!Number.isFinite(opened) || Date.now() - opened < 2000) return { ok: false, error: "Please take a moment to write your message, then try again." };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"), email: formData.get("email"), message: formData.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => { fieldErrors[String(i.path[0])] ??= i.message; });
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  if (!hasSupabaseEnv()) return { ok: false, error: "The contact form is not configured yet." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.CONTACT_HASH_SALT ?? ""}:${ip}`).digest("hex");

  const { error } = await createPublicClient().rpc("submit_contact_message", {
    p_name: parsed.data.name, p_email: parsed.data.email, p_message: parsed.data.message, p_ip_hash: ipHash,
  });
  if (error) {
    if (error.message.includes("rate_limited")) return { ok: false, error: "Too many messages from your network. Please try again later." };
    console.error("[contact]", error.message);
    return { ok: false, error: "Could not send your message. Please try again." };
  }
  return { ok: true };
}
