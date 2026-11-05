"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Img from "@/components/ui/Img";
import Lightbox, { type LightboxItem } from "@/components/ui/Lightbox";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { isPdfPath } from "@/lib/storage";
import { cn, formatDate } from "@/lib/utils";
import type { Hackathon } from "@/types";

const LABEL: Record<string, string> = {
  first_place: "1st Place", second_place: "2nd Place", third_place: "3rd Place", winner: "Winner",
  finalist: "Finalist", participant: "Participant", other: "Participated",
};
const PLACEMENTS = ["first_place", "second_place", "third_place", "winner"];

/** Participation is never styled or labelled as an award. Only real placements get prominence. */
function tier(h: Hackathon): 2 | 1 | 0 {
  if (PLACEMENTS.includes(h.participation_status)) return 2;
  if (h.participation_status === "finalist" || (h.participation_status === "other" && h.award)) return 1;
  return 0;
}
function badge(h: Hackathon): string {
  if (h.participation_status === "other" && h.award) return h.award;
  return LABEL[h.participation_status] ?? "Participated";
}

export default function Hackathons({ items }: { items: Hackathon[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lb, setLb] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  return (
    <section id="hackathons" aria-label="Hackathons and competitions" className="section-pad relative">
      <div className="container-x">
        <SectionHeading index="06" label="Hackathons & competitions" title="Where I've competed" />
        <ol className="relative space-y-5 md:space-y-6">
          {items.map((h) => {
            const t = tier(h);
            const certs = h.hackathon_certificates ?? [], photos = h.hackathon_images ?? [];
            const hasMore = !!(h.problem_statement || h.description || h.details || h.project_name || h.project_id || certs.length || photos.length || (t === 2 && h.award));
            const open = openId === h.id;
            const date = formatDate(h.event_date, { month: "short", year: "numeric" });
            const lbItems: LightboxItem[] = [
              ...certs.map((c) => ({ path: c.path, title: c.title || `${h.name} certificate` })),
              ...photos.map((p) => ({ path: p.path, title: p.caption || `${h.name} photograph` })),
            ];
            return (
              <li key={h.id}>
                <Reveal>
                  <article className={cn("rounded-3xl border p-6 transition-colors md:p-8",
                    t === 2 ? "border-lav/50 bg-gradient-to-br from-[#1d1a33]/90 to-surface/90" : t === 1 ? "border-blue/30 bg-surface/85" : "border-line bg-surface/60")}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="eyebrow">{[h.organizer, date, h.venue].filter(Boolean).join(" · ") || "Hackathon"}</p>
                        <h3 className={cn("font-display mt-2 leading-tight", t === 2 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>{h.name}</h3>
                        {(h.project_name) && <p className="mt-2 text-sm text-mute">Built: <span className="text-fg/90">{h.project_name}</span></p>}
                      </div>
                      <span className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide",
                        t === 2 ? "border-lav bg-lav text-ink" : t === 1 ? "border-blue/60 text-blue" : "border-line text-mute")}>
                        {t === 2 && <span aria-hidden>★ </span>}{badge(h)}
                      </span>
                    </div>
                    {t === 2 && h.award && h.award.toLowerCase() !== badge(h).toLowerCase() && <p className="mt-3 text-fg/85">{h.award}</p>}

                    {hasMore && (
                      <>
                        <button type="button" className="mt-5 text-sm text-lav underline-offset-4 hover:underline" aria-expanded={open} aria-controls={`hk-${h.id}`}
                          onClick={() => setOpenId(open ? null : h.id)}>{open ? "Hide details" : "View details"}</button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div id={`hk-${h.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="space-y-5 pt-6 text-fg/85">
                                {h.problem_statement && <div><p className="eyebrow mb-1">Problem statement</p><p className="whitespace-pre-line">{h.problem_statement}</p></div>}
                                {h.description && <p className="whitespace-pre-line">{h.description}</p>}
                                {h.details && <p className="whitespace-pre-line text-mute">{h.details}</p>}
                                {lbItems.length > 0 && (
                                  <ul className="flex flex-wrap gap-3">
                                    {lbItems.map((it, i) => (
                                      <li key={it.path}>
                                        <button type="button" onClick={() => setLb({ items: lbItems, index: i })} aria-label={`Enlarge ${it.title}`}
                                          className="relative grid h-24 w-32 place-items-center overflow-hidden rounded-xl border border-line bg-raise hover:border-lav">
                                          {isPdfPath(it.path) ? <span className="text-xs font-semibold text-mute">PDF</span> : <Img path={it.path} alt="" sizes="128px" />}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
      <Lightbox items={lb?.items ?? []} index={lb ? lb.index : null} onClose={() => setLb(null)} onIndex={(i) => setLb((s) => (s ? { ...s, index: i } : s))} />
    </section>
  );
}
