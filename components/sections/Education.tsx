import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/utils";
import type { Education } from "@/types";

function span(e: Education): string | null {
  const start = formatDate(e.start_date);
  const end = e.is_ongoing ? "Present" : formatDate(e.end_date);
  if (!start && !end) return null;
  return [start, end].filter(Boolean).join(" — ");
}

export default function EducationSection({ items }: { items: Education[] }) {
  return (
    <section id="education" aria-label="Education" className="section-pad relative bg-ink/75 backdrop-blur-[2px]">
      <div className="container-x">
        <SectionHeading index="03" label="Education" title="Where I'm learning" />
        <ol className="relative space-y-10 border-l border-line pl-7 md:pl-12">
          {items.map((e) => {
            const results = e.education_results ?? [];
            return (
              <li key={e.id} className="relative">
                <span aria-hidden className="absolute -left-[2.2rem] top-2 size-3 rounded-full border-2 border-lav bg-ink md:-left-[3.4rem]" />
                <Reveal>
                  <article className="grid gap-8 rounded-3xl border border-line bg-surface/80 p-6 md:grid-cols-[1.4fr_1fr] md:p-9">
                    <div>
                      {span(e) && <p className="eyebrow text-lav">{span(e)}</p>}
                      <h3 className="font-display mt-2 text-3xl leading-tight md:text-4xl">{e.institution}</h3>
                      {(e.degree || e.branch) && <p className="mt-2 text-fg/85">{[e.degree, e.branch].filter(Boolean).join(" · ")}</p>}
                      {e.academic_year && <p className="mt-1 text-sm text-mute">{e.academic_year}</p>}
                      {e.description && <p className="mt-4 max-w-prose text-pretty text-mute">{e.description}</p>}
                    </div>
                    <div className="space-y-6">
                      {e.cgpa !== null && (
                        <div>
                          <p className="eyebrow">Overall CGPA</p>
                          <p className="font-display mt-1 text-6xl font-light tracking-tight">{Number(e.cgpa).toFixed(2)}<span className="ml-1 text-xl text-mute">/ 10</span></p>
                        </div>
                      )}
                      {results.length > 0 && (
                        <div>
                          <p className="eyebrow mb-3">Semester SGPA</p>
                          <div className="flex h-28 items-end gap-2" role="img" aria-label={`SGPA by semester: ${results.map((r) => `semester ${r.semester} ${r.sgpa}`).join(", ")}`}>
                            {results.map((r) => (
                              <div key={r.id} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                                <span className="text-[.7rem] tabular-nums text-fg/80">{Number(r.sgpa).toFixed(2)}</span>
                                <div className="w-full rounded-t-md bg-gradient-to-t from-blue/60 to-lav" style={{ height: `${Math.max(6, Number(r.sgpa) * 10 * 0.62)}%` }} />
                                <span className="text-[.68rem] text-mute">S{r.semester}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
