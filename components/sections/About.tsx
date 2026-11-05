import Img from "@/components/ui/Img";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { paragraphs } from "@/lib/utils";
import type { Profile } from "@/types";

export default function About({ profile }: { profile: Profile }) {
  const text = paragraphs(profile.about ?? profile.intro);
  const initials = profile.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section id="about" aria-label="About me" className="section-pad relative">
      <div className="container-x grid gap-12 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm md:sticky md:top-28">
            <div aria-hidden className="absolute -inset-3 translate-x-3 translate-y-3 rounded-[2rem] border border-lav/30" />
            <div className="relative size-full overflow-hidden rounded-[2rem] border border-line bg-surface">
              {profile.photo_path
                ? <Img path={profile.photo_path} alt={`Portrait of ${profile.name}`} sizes="(min-width: 768px) 30vw, 80vw" />
                : <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#241f3d,#101016_70%)]"><span className="font-display text-8xl font-light text-lav/80">{initials}</span></div>}
            </div>
          </div>
        </Reveal>
        <div className="md:col-span-7 md:pt-10">
          <SectionHeading index="02" label="About" title="A little about me" />
          <div className="space-y-5 text-pretty text-lg leading-relaxed text-fg/85">
            {text.map((p, i) => <Reveal key={i} delay={i * 0.05}><p>{p}</p></Reveal>)}
          </div>
          {(profile.location || profile.email) && (
            <Reveal className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-6 text-sm">
              {profile.location && <div><p className="eyebrow">Based in</p><p className="mt-1">{profile.location}</p></div>}
              {profile.email && <div><p className="eyebrow">Email</p><a className="mt-1 block underline decoration-line underline-offset-4 hover:decoration-lav" href={`mailto:${profile.email}`}>{profile.email}</a></div>}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
