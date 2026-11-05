"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getTable, type TableDef } from "@/lib/admin-config";
import { deleteRow, reorderRows, setStatus } from "@/lib/actions/content";
import ChildManager from "./ChildManager";
import RowForm, { type Option } from "./RowForm";
import StatusBadge from "./StatusBadge";

type Row = Record<string, unknown>;

export default function EntityManager({ def, rows, childRows, options }: {
  def: TableDef; rows: Row[]; childRows: Record<string, Row[]>; options: Record<string, Option[]>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => { const r = await fn(); setError(r.ok ? null : r.error ?? "Failed"); router.refresh(); });

  const move = (i: number, d: -1 | 1) => {
    const ids = rows.map((r) => r.id as string); const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run(() => reorderRows(def.table, ids));
  };
  const remove = (r: Row) => {
    if (!confirm(`Delete "${String(r[def.titleField] ?? "this item")}"? This also removes its uploaded files and cannot be undone.`)) return;
    run(() => deleteRow(def.table, r.id as string));
  };
  const labelFor = (r: Row) => {
    const rel = def.fields.find((f) => f.type === "relation" && f.required);
    const relLabel = rel ? options[rel.relation!.table]?.find((o) => o.value === r[rel.name])?.label : null;
    return { title: String(r[def.titleField] || "(untitled)"), sub: [relLabel, def.subtitleField ? (r[def.subtitleField] as string | null) : null].filter(Boolean).join(" · ") };
  };

  return (
    <section aria-label={def.title} className="mb-14">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl">{def.title} <span className="text-lg text-mute">({rows.length})</span></h2>
        {editing === null && <button type="button" className="btn btn-solid" onClick={() => setEditing("new")}>+ New {def.singular}</button>}
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

      {editing === "new" && (
        <div className="mb-6 rounded-3xl border border-lav/40 bg-surface p-6">
          <h3 className="mb-5 text-lg font-semibold">New {def.singular}</h3>
          <RowForm def={def} row={null} options={options} onDone={() => { setEditing(null); router.refresh(); }} onCancel={() => setEditing(null)} />
          {def.children && <p className="mt-4 text-xs text-mute">Save first, then edit to add {def.children.map((c) => c.label.toLowerCase()).join(" and ")}.</p>}
        </div>
      )}

      {rows.length === 0 && editing !== "new" && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-mute">Nothing here yet.</p>}

      <ul className="space-y-3" aria-busy={pending}>
        {rows.map((r, i) => {
          const id = r.id as string; const { title, sub } = labelFor(r);
          return (
            <li key={id} className="rounded-2xl border border-line bg-surface p-4">
              {editing === id ? (
                <div className="p-2">
                  <RowForm def={def} row={r} options={options} onDone={() => { setEditing(null); router.refresh(); }} onCancel={() => setEditing(null)} />
                  {def.children?.map((c) => {
                    const cd = getTable(c.table)!;
                    return <ChildManager key={c.table} def={cd} label={c.label} fk={c.fk} parentId={id} rows={(childRows[c.table] ?? []).filter((x) => x[c.fk] === id)} />;
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{title}</p>
                    {sub && <p className="truncate text-sm text-mute">{sub}</p>}
                  </div>
                  {def.hasStatus && (
                    <>
                      <StatusBadge status={String(r.status)} />
                      <label className="sr-only" htmlFor={`st-${id}`}>Visibility of {title}</label>
                      <select id={`st-${id}`} className="field !min-h-9 !w-auto !py-1 text-sm" value={String(r.status)} disabled={pending}
                        onChange={(e) => run(() => setStatus(def.table, id, e.target.value))}>
                        <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                      </select>
                    </>
                  )}
                  <button type="button" aria-label="Move up" className="btn !min-h-9 !px-3" disabled={i === 0 || pending} onClick={() => move(i, -1)}>↑</button>
                  <button type="button" aria-label="Move down" className="btn !min-h-9 !px-3" disabled={i === rows.length - 1 || pending} onClick={() => move(i, 1)}>↓</button>
                  <button type="button" className="btn !min-h-9" onClick={() => setEditing(id)}>Edit</button>
                  <button type="button" className="btn !min-h-9 hover:!border-red-400" onClick={() => remove(r)}>Delete</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
