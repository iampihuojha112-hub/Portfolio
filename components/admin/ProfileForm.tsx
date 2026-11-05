"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/actions/profile";
import type { Profile } from "@/types";
import FileField from "./FileField";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [v, setV] = useState({
    name: profile.name, tagline: profile.tagline ?? "", intro: profile.intro ?? "", about: profile.about ?? "",
    email: profile.email ?? "", location: profile.location ?? "", photo_path: profile.photo_path ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  const row = (k: keyof typeof v, label: string, help?: string, area = false) => (
    <div>
      <label htmlFor={`p-${k}`} className="mb-1.5 block text-sm font-medium">{label}</label>
      {area ? <textarea id={`p-${k}`} className="field min-h-40" value={v[k]} onChange={set(k)} /> : <input id={`p-${k}`} className="field" value={v[k]} onChange={set(k)} />}
      <p className={errors[k] ? "mt-1 text-sm text-red-300" : "mt-1 text-xs text-mute"}>{errors[k] ?? help ?? ""}</p>
    </div>
  );

  return (
    <form noValidate className="space-y-5" onSubmit={(e) => {
      e.preventDefault(); setErrors({}); setMsg(null);
      start(async () => {
        const r = await saveProfile(v);
        if (r.ok) { setMsg({ ok: true, text: "Saved. The public site is updated." }); router.refresh(); }
        else { setErrors(r.fieldErrors ?? {}); setMsg({ ok: false, text: r.error }); }
      });
    }}>
      {row("name", "Name")}
      {row("tagline", "Hero tagline", "One distinctive line shown under your name.")}
      {row("intro", "Short introduction", "Shown in the hero.", true)}
      {row("about", "About me", "Separate paragraphs with a blank line.", true)}
      {row("email", "Public email", "Shown in About and Contact. Leave empty to hide.")}
      {row("location", "Location", "Optional.")}
      <div>
        <label htmlFor="p-photo" className="mb-1.5 block text-sm font-medium">Profile photograph</label>
        <FileField id="p-photo" kind="profile" label="Profile photograph" value={v.photo_path || null} onChange={(p) => setV((s) => ({ ...s, photo_path: p ?? "" }))} />
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-sm text-emerald-300" : "text-sm text-red-300"}>{msg.text}</p>}
      <button type="submit" className="btn btn-solid" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}
