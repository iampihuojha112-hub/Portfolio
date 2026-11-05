import { notFound } from "next/navigation";
import EntityManager from "@/components/admin/EntityManager";
import type { Option } from "@/components/admin/RowForm";
import { getTable, SECTION_ROUTES } from "@/lib/admin-config";
import { requireAdminPage } from "@/lib/auth/admin";
import { listChildren, listRows } from "@/lib/database/admin";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const tables = Object.prototype.hasOwnProperty.call(SECTION_ROUTES, section) ? SECTION_ROUTES[section] : null;
  if (!tables) notFound();
  const { supabase } = await requireAdminPage();

  // Option lists for relation fields (e.g. skill -> category, hackathon -> project)
  const options: Record<string, Option[]> = {};
  const relTables = new Set(tables.flatMap((t) => getTable(t)!.fields.filter((f) => f.type === "relation").map((f) => f.relation!.table)));
  for (const rt of relTables) {
    const def = getTable(rt)!;
    const rows = await listRows(supabase, rt);
    options[rt] = rows.map((r) => ({ value: r.id as string, label: String(r[def.titleField] ?? "") }));
  }

  return (
    <>
      <h1 className="sr-only">{tables.map((t) => getTable(t)!.title).join(" & ")}</h1>
      {await Promise.all(tables.map(async (t) => {
        const def = getTable(t)!;
        const rows = await listRows(supabase, t);
        const childRows: Record<string, Record<string, unknown>[]> = {};
        for (const c of def.children ?? []) childRows[c.table] = await listChildren(supabase, c.table, c.fk, rows.map((r) => r.id as string));
        return <EntityManager key={t} def={def} rows={rows} childRows={childRows} options={options} />;
      }))}
    </>
  );
}
