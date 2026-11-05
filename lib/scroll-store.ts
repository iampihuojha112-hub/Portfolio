// Plain mutable store read inside the render loop (no React re-renders on scroll).
export const scrollState = { progress: 0, velocity: 0, lenis: null as null | { scrollTo: (t: string | number | HTMLElement, o?: object) => void } };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (scrollState.lenis) scrollState.lenis.scrollTo(el, { offset: 0, duration: 1.2 });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function scrollToTop() {
  if (scrollState.lenis) scrollState.lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0 });
}
