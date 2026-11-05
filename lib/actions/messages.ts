"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { guard, userError, type ActionResult } from "./result";

const id = z.string().uuid();

export async function setMessageRead(messageId: string, read: boolean): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("contact_messages").update({ is_read: read }).eq("id", id.parse(messageId));
    if (error) throw userError("Could not update the message.");
    revalidatePath("/admin", "layout");
  });
}

export async function deleteMessage(messageId: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id.parse(messageId));
    if (error) throw userError("Could not delete the message.");
    revalidatePath("/admin", "layout");
  });
}
