"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { SkillCategory } from "@/types";

const DOTS = ["#b9aaff", "#5b8cff", "#8fd3ff", "#d6a8ff", "#7fe0c3"];

export default function Skills({ categories }: { categories: SkillCategory[] }) {
  const [focus, setFocus] = useState<string | null>(null);
  return (
    <section id="skills" aria-label="Technical skills" className="section-pad relative">
      <div className="container-x">
        <SectionHeading index="04" label="Technical skills" title="Tools I work with" />
        <p className="-mt-8 mb-12 max-w-xl text-mute">Technologies I have used while building projects, grouped by what they are for. Hover or focus a group to isolate it.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" onMouseLeave={() => setFocus(null)}>
          {categories.map((c, ci) => (
            <Reveal key={c.id} delay={(ci % 3) * 0.06}>
              <section tabIndex={0} aria-label={c.name} onMouseEnter={() => setFocus(c.id)} onFocus={() => setFocus(c.id)} onBlur={() => setFocus(null)}
                className={cn("h-full rounded-3xl border border-line bg-surface/80 p-6 transition-all duration-500 hover:border-lav/50",
                  focus && focus !== c.id && "opacity-40")}>
                <header className="mb-5 flex items-baseline justify-between">
                  <h3 className="font-display text-2xl">{c.name}</h3>
                  <span className="text-xs tabular-nums text-mute">{String(c.skills?.length ?? 0).padStart(2, "0")}</span>
                </header>
                <ul className="flex flex-wrap gap-2">
                  {(c.skills ?? []).map((s, si) => (
                    <li key={s.id} className="chip transition-transform hover:-translate-y-0.5">
                      <span aria-hidden className="size-1.5 rounded-full" style={{ background: DOTS[(ci + si) % DOTS.length] }} />{s.name}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
