import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/admin";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function guard<T = void>(fn: () => Promise<T | undefined>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: "You are not authorized to do that." };
    if (e instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of e.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
    }
    if (e instanceof Error && e.message.startsWith("USER:")) return { ok: false, error: e.message.slice(5) };
    console.error("[action]", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export const userError = (msg: string) => new Error(`USER:${msg}`);
