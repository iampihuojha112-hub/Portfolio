import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { Interest } from "@/types";

export default function BeyondCoding({ items }: { items: Interest[] }) {
  return (
    <section id="beyond" aria-label="Beyond coding" className="section-pad relative bg-cream text-cocoa">
      <div className="container-x">
        <SectionHeading tone="light" index="08" label="Beyond coding" title="The rest of me" />
        <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid">
          {items.map((it, i) => (
            <li key={it.id}>
              <Reveal delay={(i % 3) * 0.06}>
                <article className={cn("overflow-hidden rounded-[1.6rem] border border-cocoa/15 bg-white/55 shadow-[0_1px_0_rgba(43,36,32,.06)] transition-transform duration-500 hover:rotate-0",
                  i % 2 === 0 ? "-rotate-[0.8deg]" : "rotate-[0.8deg]")}>
                  {it.image_path && <div className="relative aspect-[4/3]"><Img path={it.image_path} alt={it.title} sizes="(min-width: 1024px) 30vw, 90vw" /></div>}
                  <div className="p-6">
                    {it.category && <p className="eyebrow !text-clay">{it.category}</p>}
                    <h3 className="font-display mt-1 text-3xl leading-tight">{it.title}</h3>
                    {it.description && <p className="mt-3 text-pretty text-cocoa/80">{it.description}</p>}
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
