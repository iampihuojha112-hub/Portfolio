"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { scrollState } from "@/lib/scroll-store";


/** Lenis smooth scrolling (disabled for reduced motion) + a scroll-progress value for the 3D scene. */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;

    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      scrollState.lenis = lenis;
      tick = (t: number) => lenis?.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    let last = window.scrollY;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      scrollState.velocity = window.scrollY - last;
      last = window.scrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      scrollState.lenis = null;
    };
  }, []);
  return null;
}
