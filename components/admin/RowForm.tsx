"use client";

import { useState, useTransition } from "react";
import type { FieldDef, TableDef } from "@/lib/admin-config";
import { saveRow } from "@/lib/actions/content";
import FileField from "./FileField";

type Values = Record<string, string | boolean | null>;
export type Option = { value: string; label: string };

function initialValues(def: TableDef, row: Record<string, unknown> | null): Values {
  const v: Values = {};
  for (const f of def.fields) {
    const raw = row?.[f.name];
    if (f.type === "boolean") v[f.name] = raw === undefined ? f.name === "is_ongoing" : Boolean(raw);
    else if (f.type === "tags") v[f.name] = Array.isArray(raw) ? (raw as string[]).join("\n") : "";
    else v[f.name] = raw === null || raw === undefined ? (f.type === "select" ? f.options?.[0]?.value ?? "" : "") : String(raw);
  }
  if (def.hasStatus) v.status = (row?.status as string) ?? "draft";
  return v;
}

export default function RowForm({ def, row, extra, options, onDone, onCancel, submitLabel }: {
  def: TableDef; row: Record<string, unknown> | null; extra?: Record<string, unknown>; options?: Record<string, Option[]>;
  onDone: (id: string) => void; onCancel?: () => void; submitLabel?: string;
}) {
  const [values, setValues] = useState<Values>(() => initialValues(def, row));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const rowId = (row?.id as string | undefined) ?? null;
  const set = (name: string, v: string | boolean | null) => setValues((s) => ({ ...s, [name]: v }));
  const uid = `${def.table}-${rowId ?? "new"}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({}); setMessage(null);
    const payload: Record<string, unknown> = { ...extra };
    for (const f of def.fields) {
      const v = values[f.name];
      payload[f.name] = f.type === "tags" ? String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean) : v;
    }
    if (def.hasStatus) payload.status = values.status;
    start(async () => {
      const res = await saveRow(def.table, rowId, payload);
      if (res.ok) onDone(res.data?.id ?? rowId ?? "");
      else { setErrors(res.fieldErrors ?? {}); setMessage(res.error); }
    });
  }

  const control = (f: FieldDef) => {
    const id = `${uid}-${f.name}`;
    const v = values[f.name];
    const common = { id, "aria-invalid": !!errors[f.name], "aria-describedby": `${id}-d` };
    switch (f.type) {
      case "textarea": return <textarea {...common} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "tags": return <textarea {...common} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder="One item per line" />;
      case "boolean": return <label className="flex items-center gap-2 text-sm"><input id={id} type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} className="size-4 accent-[var(--color-lav)]" /> Yes</label>;
      case "select": return <select {...common} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      case "relation": {
        const list = options?.[f.relation!.table] ?? [];
        return <select {...common} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">{f.required ? "Select…" : "None"}</option>{list.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
      }
      case "file": return <FileField id={id} kind={f.uploadKind!} label={f.label} value={(v as string) || null} onChange={(p) => set(f.name, p ?? "")} />;
      case "date": return <input {...common} type="date" className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "number": return <input {...common} type="number" inputMode="decimal" min={f.min} max={f.max} step={f.step ?? "any"} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      case "url": return <input {...common} type="text" inputMode="url" placeholder={f.allowMailto ? "https://… or mailto:…" : "https://…"} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
      default: return <input {...common} type="text" maxLength={f.max ?? 300} className="field" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />;
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {def.fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={`${uid}-${f.name}`} className="mb-1.5 block text-sm font-medium">{f.label}{f.required && <span className="text-lav"> *</span>}</label>
          {control(f)}
          <p id={`${uid}-${f.name}-d`} className={errors[f.name] ? "mt-1 text-sm text-red-300" : "mt-1 text-xs text-mute"}>{errors[f.name] ?? f.help ?? ""}</p>
        </div>
      ))}
      {def.hasStatus && (
        <div>
          <label htmlFor={`${uid}-status`} className="mb-1.5 block text-sm font-medium">Visibility</label>
          <select id={`${uid}-status`} className="field" value={String(values.status)} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft (hidden)</option><option value="published">Published</option><option value="archived">Archived (hidden)</option>
          </select>
        </div>
      )}
      {message && <p role="alert" className="text-sm text-red-300">{message}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn btn-solid" disabled={pending}>{pending ? "Saving…" : submitLabel ?? "Save"}</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
