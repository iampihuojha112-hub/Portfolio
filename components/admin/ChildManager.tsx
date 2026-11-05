"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TableDef } from "@/lib/admin-config";
import { deleteRow, reorderRows } from "@/lib/actions/content";
import { isPdfPath, publicUrl } from "@/lib/storage";
import RowForm from "./RowForm";

/** Manages a parent's child rows (screenshots, certificates, semester SGPA...). */
export default function ChildManager({ def, label, fk, parentId, rows }: {
  def: TableDef; label: string; fk: string; parentId: string; rows: Record<string, unknown>[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const fileField = def.fileFields[0];

  const done = () => { setEditing(null); router.refresh(); };
  const remove = (id: string) => {
    if (!confirm("Delete this item? Its file will also be removed.")) return;
    start(async () => { const r = await deleteRow(def.table, id); if (!r.ok) setError(r.error); router.refresh(); });
  };
  const move = (i: number, d: -1 | 1) => {
    const ids = rows.map((r) => r.id as string); const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    start(async () => { const r = await reorderRows(def.table, ids); if (!r.ok) setError(r.error); router.refresh(); });
  };

  return (
    <div className="mt-8 rounded-2xl border border-line bg-ink/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{label} <span className="text-mute">({rows.length})</span></h4>
        {editing === null && <button type="button" className="btn !min-h-9 !text-xs" onClick={() => setEditing("new")}>+ Add</button>}
      </div>
      {error && <p role="alert" className="mb-2 text-sm text-red-300">{error}</p>}
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const path = fileField ? (r[fileField] as string | undefined) : undefined;
          const url = publicUrl(path);
          const title = String(r.caption ?? r.title ?? (def.table === "education_results" ? `Semester ${r.semester}: SGPA ${r.sgpa}` : "Item"));
          return (
            <li key={r.id as string} className="rounded-xl border border-line bg-surface p-2">
              {editing === r.id ? (
                <div className="p-2"><RowForm def={def} row={r} extra={{ [fk]: parentId }} onDone={done} onCancel={() => setEditing(null)} /></div>
              ) : (
                <div className="flex items-center gap-3">
                  {path && url && (isPdfPath(path)
                    ? <span className="grid h-12 w-16 place-items-center rounded-lg bg-raise text-[.65rem] font-semibold text-mute">PDF</span>
                    // eslint-disable-next-line @next/next/no-img-element
                    : <img src={url} alt="" className="h-12 w-16 rounded-lg object-cover" />)}
                  <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
                  <button type="button" aria-label="Move up" className="btn !min-h-8 !px-2.5" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" aria-label="Move down" className="btn !min-h-8 !px-2.5" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>↓</button>
                  <button type="button" className="btn !min-h-8 !text-xs" onClick={() => setEditing(r.id as string)}>Edit</button>
                  <button type="button" className="btn !min-h-8 !text-xs hover:!border-red-400" onClick={() => remove(r.id as string)}>Delete</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {editing === "new" && (
        <div className="mt-3 rounded-xl border border-lav/30 bg-surface p-4">
          <RowForm def={def} row={null} extra={{ [fk]: parentId }} onDone={done} onCancel={() => setEditing(null)} submitLabel="Add" />
        </div>
      )}
    </div>
  );
}
