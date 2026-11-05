"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Img from "@/components/ui/Img";
import { safeHref } from "@/lib/utils";
import type { Project } from "@/types";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-8"><h3 className="eyebrow mb-3 text-lav">{title}</h3>{children}</section>;
}

export default function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [shot, setShot] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => { setShot(0); }, [project?.id]);
  useEffect(() => {
    if (!project) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("button, a[href]");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; returnFocus.current?.focus(); };
  }, [project, onClose]);

  const p = project;
  const images = p ? [...(p.thumbnail_path ? [{ id: "thumb", path: p.thumbnail_path, caption: null as string | null }] : []), ...(p.project_images ?? [])] : [];
  const github = safeHref(p?.github_url), demo = safeHref(p?.demo_url);

  return typeof document === "undefined" ? null : createPortal(
    <AnimatePresence>
      {p && (
        <motion.div className="fixed inset-0 z-[75] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm md:p-6" onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={`${p.title} details`} onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface p-6 md:p-10" data-lenis-prevent>
            <div className="flex items-start justify-between gap-4">
              <div>
                {p.category && <p className="eyebrow text-lav">{p.category}</p>}
                <h2 className="font-display mt-2 text-4xl leading-tight md:text-5xl">{p.title}</h2>
              </div>
              <button ref={closeBtn} type="button" onClick={onClose} className="btn !min-h-10 shrink-0" aria-label="Close project details">Close</button>
            </div>
            {p.intro && <p className="mt-4 text-lg text-fg/85">{p.intro}</p>}

            {images.length > 0 && (
              <div className="mt-8">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-ink">
                  <Img path={images[Math.min(shot, images.length - 1)].path} alt={`${p.title} screenshot ${shot + 1}`} sizes="(min-width: 768px) 42rem, 100vw" fit="contain" />
                </div>
                {images.length > 1 && (
                  <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Screenshots">
                    {images.map((im, i) => (
                      <li key={im.id}>
                        <button type="button" onClick={() => setShot(i)} aria-label={`Show screenshot ${i + 1}`} aria-current={i === shot}
                          className={`relative block h-14 w-24 overflow-hidden rounded-lg border ${i === shot ? "border-lav" : "border-line opacity-70"}`}>
                          <Img path={im.path} alt="" sizes="96px" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {p.description && <Block title="Overview"><p className="whitespace-pre-line text-pretty text-fg/85">{p.description}</p></Block>}
            {p.problem && <Block title="Problem"><p className="whitespace-pre-line text-fg/85">{p.problem}</p></Block>}
            {p.solution && <Block title="Solution"><p className="whitespace-pre-line text-fg/85">{p.solution}</p></Block>}
            {p.features.length > 0 && (
              <Block title="Key features">
                <ul className="space-y-2 text-fg/85">{p.features.map((f, i) => <li key={i} className="flex gap-3"><span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-lav" />{f}</li>)}</ul>
              </Block>
            )}
            {p.technologies.length > 0 && <Block title="Technologies"><ul className="flex flex-wrap gap-2">{p.technologies.map((t) => <li key={t} className="chip">{t}</li>)}</ul></Block>}
            {p.contribution && <Block title="My contribution"><p className="whitespace-pre-line text-fg/85">{p.contribution}</p></Block>}

            {(github || demo) && (
              <div className="mt-10 flex flex-wrap gap-3">
                {github && <a className="btn btn-solid" href={github} target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>}
                {demo && <a className="btn" href={demo} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
