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
        ? <Img path={path} alt={`${p.title} preview`} sizes="(min-width: 1024px) 40vw, 90vw" fit="contain" className="transition-transform duration-700 group-hover:scale-[1.04]" />
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

  return (
    <section
      id="projects"
      aria-label="Projects"
      className="section-pad relative bg-ink/80 backdrop-blur-[2px]"
    >
      <div className="container-x">
        <SectionHeading
          index="05"
          label="Projects"
          title="Things I've built"
        />

        <div className="space-y-24 md:space-y-32">
          {projects.map((p, i) => {
            const reverse = i % 2 === 1;

            return (
              <Reveal key={p.id}>
                <article className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-14">

                  {/* Project Thumbnail */}
                  <Tilt
                    className={cn(
                      "lg:col-span-7",
                      reverse && "lg:order-2"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(p)}
                      aria-label={`Open details for ${p.title}`}
                      className="block w-full text-left"
                    >
                      <Visual
                        p={p}
                        className="aspect-[16/9] w-full"
                      />
                    </button>
                  </Tilt>

                  {/* Project Information */}
                  <div
                    className={cn(
                      "lg:col-span-5",
                      reverse && "lg:order-1"
                    )}
                  >
                    <p className="eyebrow text-lav">
                      {String(i + 1).padStart(2, "0")}
                      {p.category ? ` · ${p.category}` : ""}
                    </p>

                    <h3 className="font-display mt-3 text-4xl leading-[1.05] md:text-5xl">
                      {p.title}
                    </h3>

                    {p.intro && (
                      <p className="mt-4 text-pretty text-lg text-fg/85">
                        {p.intro}
                      </p>
                    )}

                    <div className="mt-6">
                      <Techs list={p.technologies} n={5} />
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpen(p)}
                      className="btn mt-8"
                    >
                      Explore project →
                    </button>
                  </div>

                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <ProjectModal project={open} onClose={close} />
    </section>
  );
}
