import type { SupabaseClient } from "@supabase/supabase-js";
import { getTable } from "@/lib/admin-config";

export interface Overview {
  publishedProjects: number; hackathons: number; certificates: number; drafts: number; unreadMessages: number;
  recent: { table: string; label: string; title: string; updated_at: string }[];
}

export async function getOverview(client: SupabaseClient): Promise<Overview> {
  const head = (table: string) => client.from(table).select("id", { count: "exact", head: true });
  const contentTables = ["education", "skill_categories", "skills", "projects", "hackathons", "certifications", "interests", "social_links"];

  const [pub, hacks, certs, unread, ...drafts] = await Promise.all([
    head("projects").eq("status", "published"),
    head("hackathons").neq("status", "archived"),
    head("certifications").neq("status", "archived"),
    head("contact_messages").eq("is_read", false),
    ...contentTables.map((t) => head(t).eq("status", "draft")),
  ]);

  const recentTables = ["projects", "hackathons", "certifications", "interests", "education"];
  const recentRows = await Promise.all(recentTables.map(async (t) => {
    const def = getTable(t)!;
    const { data } = await client.from(t).select(`${def.titleField}, updated_at`).order("updated_at", { ascending: false }).limit(3);
    return ((data ?? []) as unknown as Record<string, string>[]).map((r) => ({
      table: t, label: def.singular, title: r[def.titleField] || "(untitled)", updated_at: r.updated_at,
    }));
  }));

  return {
    publishedProjects: pub.count ?? 0,
    hackathons: hacks.count ?? 0,
    certificates: certs.count ?? 0,
    drafts: drafts.reduce((sum, r) => sum + (r.count ?? 0), 0),
    unreadMessages: unread.count ?? 0,
    recent: recentRows.flat().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8),
  };
}

export async function listRows(client: SupabaseClient, table: string): Promise<Record<string, unknown>[]> {
  const def = getTable(table);
  if (!def) return [];
  const { data, error } = await client.from(def.table).select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Record<string, unknown>[];
}

export async function listChildren(client: SupabaseClient, table: string, fk: string, parentIds: string[]) {
  if (!parentIds.length) return [] as Record<string, unknown>[];
  const { data, error } = await client.from(table).select("*").in(fk, parentIds).order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Record<string, unknown>[];
}

