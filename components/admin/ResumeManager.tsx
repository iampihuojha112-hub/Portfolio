"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addResume, deleteResume, publishResume, unpublishResume } from "@/lib/actions/resume";
import { publicUrl } from "@/lib/storage";
import type { Resume } from "@/types";
import FileField from "./FileField";
import StatusBadge from "./StatusBadge";

export default function ResumeManager({ resumes }: { resumes: Resume[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [fileKey, setFileKey] = useState(0);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => { const r = await fn(); setError(r.ok ? null : r.error ?? "Failed"); router.refresh(); });

  const onUploaded = (path: string | null) => {
    if (!path) return;
    run(async () => {
      const added = await addResume(path, label || null);
      if (!added.ok) return added;
      setLabel(""); setFileKey((k) => k + 1);
      return publishNow && added.data ? publishResume(added.data.id) : added;
    });
  };

  return (
    <>
      <div className="rounded-3xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Upload a new resume (PDF)</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="r-label" className="mb-1.5 block text-sm font-medium">Label (optional)</label>
            <input id="r-label" className="field" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Resume — Nov 2026" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--color-lav)]" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} /> Publish immediately (replaces the current resume)</label>
          <FileField key={fileKey} id="r-file" kind="resume" label="Resume PDF" value={null} onChange={onUploaded} />
        </div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}

      <h2 className="font-display mb-4 mt-12 text-2xl">Your resumes</h2>
      {resumes.length === 0 && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-mute">No resume uploaded yet. The public Download Resume button stays hidden until you publish one.</p>}
      <ul className="space-y-3" aria-busy={pending}>
        {resumes.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.label || "Resume"}</p>
              <p className="text-xs text-mute">Uploaded {new Date(r.created_at).toLocaleDateString("en-IN")}</p>
            </div>
            {r.is_current ? <span className="rounded-full border border-lav px-2.5 py-0.5 text-[.7rem] font-semibold uppercase text-lav">Current</span> : <StatusBadge status={r.status} />}
            <a className="btn !min-h-9" href={publicUrl(r.file_path) ?? "#"} target="_blank" rel="noopener noreferrer">Preview ↗</a>
            {r.is_current
              ? <button type="button" className="btn !min-h-9" disabled={pending} onClick={() => run(() => unpublishResume(r.id))}>Unpublish</button>
              : <button type="button" className="btn btn-solid !min-h-9" disabled={pending} onClick={() => run(() => publishResume(r.id))}>Publish</button>}
            <button type="button" className="btn !min-h-9 hover:!border-red-400" disabled={pending}
              onClick={() => confirm("Delete this resume file permanently?") && run(() => deleteResume(r.id))}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}
