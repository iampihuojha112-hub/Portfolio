"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { scrollToId } from "@/lib/scroll-store";
import type { Profile } from "@/types";

interface Props { profile: Profile; github: string | null; linkedin: string | null; leetcode: string | null; hasResume: boolean }

export default function Hero({ profile, github, linkedin, leetcode, hasResume }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-char", { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.035, delay: 0.7 });
      gsap.from(".hero-fade", { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 1.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  const words = profile.name.toUpperCase().split(/\s+/);
  return (
    <section id="home" ref={root} aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-center">
      <div className="container-x pb-24 pt-32">
        <p className="hero-fade eyebrow mb-8 flex items-center gap-3"><span className="size-1.5 rounded-full bg-lav" aria-hidden /> Portfolio</p>
        <h1 id="hero-title" aria-label={profile.name} className="font-display text-[clamp(3.6rem,13vw,10.5rem)] font-light leading-[0.88] tracking-[-0.03em]">
          {words.map((w, wi) => (
            <span key={wi} className="block overflow-hidden pb-[0.08em]" aria-hidden>
              {[...w].map((c, ci) => <span key={ci} className="hero-char inline-block">{c}</span>)}
              {wi === words.length - 1 && <span className="hero-char inline-block text-lav">.</span>}
            </span>
          ))}
        </h1>
        {profile.tagline && <p className="hero-fade font-display mt-8 max-w-xl text-balance text-2xl italic leading-snug text-fg/90 md:text-3xl">{profile.tagline}</p>}
        {profile.intro && <p className="hero-fade mt-5 max-w-lg text-pretty text-[1.02rem] text-mute">{profile.intro}</p>}
        <div className="hero-fade mt-10 flex flex-wrap gap-3">
          {hasResume && <a className="btn btn-solid" href="/resume" target="_blank" rel="noopener noreferrer">Download Resume</a>}
          {github && <a className="btn" href={github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
          {linkedin && <a className="btn" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}
          {leetcode && <a className="btn" href={leetcode} target="_blank" rel="noopener noreferrer">LeetCode ↗</a>}
        </div>
      </div>
      <button type="button" onClick={() => scrollToId("about")} aria-label="Scroll to About"
        className="hero-fade absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-mute hover:text-fg md:flex">
        <span className="eyebrow">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-line"><span className="absolute inset-x-0 top-0 h-5 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-lav" /></span>
      </button>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(260%)}}`}</style>
    </section>
  );
}
