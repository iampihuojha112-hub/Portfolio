"use client";

import { useState } from "react";
import Img from "@/components/ui/Img";
import Lightbox from "@/components/ui/Lightbox";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { formatDate, safeHref } from "@/lib/utils";
import type { Certification } from "@/types";

export default function Certifications({ items }: { items: Certification[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const lb = items.map((c) => ({ path: c.file_path, title: c.title || c.issuer || "Certificate" }));
  return (
    <section id="certifications" aria-label="Certifications and recognition" className="section-pad relative bg-ink/80 backdrop-blur-[2px]">
      <div className="container-x">
        <SectionHeading index="07" label="Certificates" title="Certifications & Recognition" />
        <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5 [&>li]:break-inside-avoid">
          {items.map((c, i) => {
            const meta = [c.issuer, formatDate(c.issued_date)].filter(Boolean).join(" · ");
            const verify = safeHref(c.verification_url);
            return (
              <li key={c.id}>
                <Reveal delay={(i % 3) * 0.05}>
                  <figure className="group overflow-hidden rounded-2xl border border-line bg-surface/80">
                    <button type="button" onClick={() => setIndex(i)} aria-label={`Enlarge ${c.title || "certificate"}`} className="relative block w-full text-left">
                      <div className="relative aspect-[4/3] w-full bg-raise">
                        {c.file_type === "pdf"
                          ? <div className="grid size-full place-items-center"><span className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-mute">PDF certificate</span></div>
                          : <Img path={c.file_path} alt={c.title || "Certificate"} fit="contain" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw" className="p-2 transition-transform duration-500 group-hover:scale-[1.03]" />}
                      </div>
                    </button>
                    {(c.title || meta || c.description || verify) && (
                      <figcaption className="space-y-1 border-t border-line p-4">
                        {c.title && <p className="font-display text-lg leading-snug">{c.title}</p>}
                        {meta && <p className="text-xs text-mute">{meta}</p>}
                        {c.description && <p className="text-sm text-fg/80">{c.description}</p>}
                        {verify && <a href={verify} target="_blank" rel="noopener noreferrer" className="inline-block pt-1 text-xs text-lav underline-offset-4 hover:underline">Verify ↗</a>}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
      <Lightbox items={lb} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}
