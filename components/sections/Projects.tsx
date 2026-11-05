"use client";

import { useCallback, useState } from "react";
import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Tilt from "@/components/ui/Tilt";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import ProjectModal from "./ProjectModal";

const cover = (p: Project) => p.thumbnail_path ?? p.project_images?.[0]?.path ?? null;

function Visual({ p, className }: { p: Project; className?: string }) {
  const path = cover(p);
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-line bg-raise", className)}>
      {path
        ? <Img path={path} alt={`${p.title} preview`} sizes="(min-width: 1024px) 40vw, 90vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
        : <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_25%_20%,#2a2450,#12121a_65%)]"><span className="font-display text-7xl font-light text-lav/70">{p.title.slice(0, 1)}</span></div>}
    </div>
  );
}

function Techs({ list, n }: { list: string[]; n: number }) {
  if (!list.length) return null;
  return <ul className="flex flex-wrap gap-2">{list.slice(0, n).map((t) => <li key={t} className="chip">{t}</li>)}{list.length > n && <li className="chip text-mute">+{list.length - n}</li>}</ul>;
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" aria-label="Projects" className="section-pad relative bg-ink/80 backdrop-blur-[2px]">
      <div className="container-x">
        <SectionHeading index="05" label="Projects" title="Things I've built" />

        <div className="space-y-24 md:space-y-32">
          {featured.map((p, i) => (
            <Reveal key={p.id}>
              <article className={cn("group grid items-center gap-8 lg:grid-cols-12 lg:gap-14")}>
                <Tilt className={cn("lg:col-span-7", i % 2 === 1 && "lg:order-2")}>
                  <button type="button" onClick={() => setOpen(p)} aria-label={`Open details for ${p.title}`} className="block w-full text-left">
                    <Visual p={p} className="aspect-[16/11] w-full" />
                  </button>
                </Tilt>
                <div className="lg:col-span-5">
                  <p className="eyebrow text-lav">{String(i + 1).padStart(2, "0")}{p.category ? ` · ${p.category}` : ""}</p>
                  <h3 className="font-display mt-3 text-4xl leading-[1.05] md:text-5xl">{p.title}</h3>
                  {p.intro && <p className="mt-4 text-pretty text-lg text-fg/85">{p.intro}</p>}
                  <div className="mt-6"><Techs list={p.technologies} n={5} /></div>
                  <button type="button" onClick={() => setOpen(p)} className="btn mt-8">Explore project →</button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {rest.length > 0 && (
          <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", featured.length > 0 && "mt-28")}>
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.06}>
                <Tilt max={4} className="h-full">
                  <button type="button" onClick={() => setOpen(p)} aria-label={`Open details for ${p.title}`}
                    className="group flex h-full w-full flex-col rounded-3xl border border-line bg-surface/80 p-4 text-left transition-colors hover:border-lav/50">
                    <Visual p={p} className="aspect-[16/10] w-full" />
                    <div className="flex flex-1 flex-col p-3 pt-5">
                      {p.category && <p className="eyebrow text-lav">{p.category}</p>}
                      <h3 className="font-display mt-2 text-2xl">{p.title}</h3>
                      {p.intro && <p className="mt-2 text-sm text-mute">{p.intro}</p>}
                      <div className="mt-auto pt-5"><Techs list={p.technologies} n={3} /></div>
                    </div>
                  </button>
                </Tilt>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <ProjectModal project={open} onClose={close} />
    </section>
  );
}
