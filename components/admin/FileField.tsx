"use client";

import { useRef, useState } from "react";
import { createUploadTicket, discardUpload } from "@/lib/actions/upload";
import { BUCKET, UPLOAD_RULES, isPdfPath, publicUrl, type UploadKind } from "@/lib/storage";
import { createBrowserSupabase } from "@/lib/supabase/client";

function putWithProgress(url: string, file: File, onProgress: (n: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("network"));
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

export default function FileField({ id, kind, value, onChange, label }:
  { id: string; kind: UploadKind; value: string | null; onChange: (path: string | null) => void; label: string }) {
  const rule = UPLOAD_RULES[kind];
  const input = useRef<HTMLInputElement>(null);
  const unsaved = useRef<string | null>(null);   // uploaded in this form session but not yet saved
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File) {
    setError(null);
    if (!rule.mimes.includes(file.type)) { setError("That file type is not allowed here."); return; }
    if (file.size > rule.maxBytes) { setError(`File is too large (max ${Math.round(rule.maxBytes / 1048576)} MB).`); return; }
    setProgress(0);
    const ticket = await createUploadTicket({ kind, mime: file.type, size: file.size });
    if (!ticket.ok || !ticket.data) { setError(ticket.ok ? "Upload failed." : ticket.error); setProgress(null); return; }
    const { path, signedUrl, token } = ticket.data;
    try {
      try {
        await putWithProgress(signedUrl, file, setProgress);
      } catch {
        // Fallback to the official client method (no progress events).
        const { error: e } = await createBrowserSupabase().storage.from(BUCKET).uploadToSignedUrl(path, token, file, { contentType: file.type });
        if (e) throw e;
      }
      if (unsaved.current) void discardUpload(unsaved.current);
      unsaved.current = path;
      onChange(path);
    } catch {
      setError("Upload failed. Check your connection and the storage bucket setup, then retry.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const url = publicUrl(value);
  return (
    <div className="space-y-2">
      {value && url && (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2">
          {isPdfPath(value)
            ? <span className="grid h-14 w-20 place-items-center rounded-lg bg-raise text-xs font-semibold text-mute">PDF</span>
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={url} alt="" className="h-14 w-20 rounded-lg object-cover" />}
          <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-sm text-lav hover:underline">Preview ↗</a>
          <button type="button" className="btn !min-h-9 !px-3 !text-xs" onClick={() => onChange(null)}>Remove</button>
        </div>
      )}
      <input ref={input} id={id} type="file" accept={rule.mimes.join(",")} aria-label={label} disabled={progress !== null}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void pick(f); }}
        className="block w-full text-sm text-mute file:mr-3 file:rounded-full file:border file:border-line file:bg-raise file:px-4 file:py-2 file:text-fg hover:file:border-lav" />
      {progress !== null && (
        <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-raise">
          <div className="h-full bg-gradient-to-r from-lav to-blue transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <p className="text-xs text-mute">{rule.mimes.map((m) => m.split("/")[1]).join(", ")} · up to {Math.round(rule.maxBytes / 1048576)} MB</p>
    </div>
  );
}
