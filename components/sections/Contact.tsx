"use client";

import { useActionState, useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { submitContact, type ContactState } from "@/lib/actions/contact";
import { safeHref } from "@/lib/utils";

interface Props { name: string; email: string | null; github: string | null; linkedin: string | null; hasResume: boolean }
const initial: ContactState = { ok: false };

export default function Contact({ name, email, github, linkedin, hasResume }: Props) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [openedAt, setOpenedAt] = useState("0");
  useEffect(() => setOpenedAt(String(Date.now())), []);
  const mail = email ? safeHref(`mailto:${email}`) : null;
  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <section id="contact" aria-label="Contact" className="section-pad relative">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHeading index="09" label="Contact" title="Let's build something." />
          <Reveal>
            <p className="max-w-md text-pretty text-lg text-fg/85">I&apos;m open to internships, collaborations and conversations with fellow developers. The best way to reach me is below.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {mail && <a className="btn btn-solid" href={mail}>{email}</a>}
              {github && <a className="btn" href={github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
              {linkedin && <a className="btn" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
              {hasResume && <a className="btn" href="/resume" target="_blank" rel="noopener noreferrer">Download Resume</a>}
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-6">
          {state.ok ? (
            <div role="status" className="rounded-3xl border border-lav/40 bg-surface/80 p-8">
              <p className="font-display text-3xl">Thank you.</p>
              <p className="mt-2 text-mute">Your message has been delivered. I&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form action={action} noValidate className="space-y-4 rounded-3xl border border-line bg-surface/80 p-6 backdrop-blur md:p-8">
              <input type="hidden" name="opened_at" value={openedAt} />
              {/* Honeypot: invisible to people, tempting to bots */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>
              {(["name", "email"] as const).map((f) => (
                <div key={f}>
                  <label htmlFor={`c-${f}`} className="eyebrow mb-1.5 block">{f === "name" ? "Your name" : "Your email"}</label>
                  <input id={`c-${f}`} name={f} type={f === "email" ? "email" : "text"} autoComplete={f} required maxLength={f === "email" ? 254 : 120}
                    aria-invalid={!!err(f)} aria-describedby={err(f) ? `c-${f}-e` : undefined} className="field" />
                  {err(f) && <p id={`c-${f}-e`} className="mt-1 text-sm text-red-300">{err(f)}</p>}
                </div>
              ))}
              <div>
                <label htmlFor="c-message" className="eyebrow mb-1.5 block">Message</label>
                <textarea id="c-message" name="message" required minLength={10} maxLength={4000} aria-invalid={!!err("message")}
                  aria-describedby={err("message") ? "c-message-e" : undefined} className="field" />
                {err("message") && <p id="c-message-e" className="mt-1 text-sm text-red-300">{err("message")}</p>}
              </div>
              {state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
              <button type="submit" disabled={pending} className="btn btn-solid w-full disabled:opacity-60">{pending ? "Sending…" : "Send message"}</button>
            </form>
          )}
        </Reveal>
      </div>
      <footer className="container-x mt-24 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-mute">
        <p>© {new Date().getFullYear()} {name}</p>
        <p>Built with Next.js, Three.js and Supabase.</p>
      </footer>
    </section>
  );
}
