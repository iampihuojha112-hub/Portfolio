"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useActiveSection } from "@/hooks/useActiveSection";
import { scrollToId } from "@/lib/scroll-store";
import { cn } from "@/lib/utils";

export interface NavItem { id: string; label: string }

export default function Nav({ items }: { items: NavItem[] }) {
  const active = useActiveSection(items.map((i) => i.id));
  const [open, setOpen] = useState(false);
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); setOpen(false); scrollToId(id); };
  const current = items.find((i) => i.id === active)?.label ?? "Menu";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav aria-label="Primary" className="pointer-events-auto relative">
        {/* Desktop pill */}
        <ul className="hidden items-center gap-1 rounded-full border border-line bg-ink/70 p-1.5 backdrop-blur-xl md:flex">
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} onClick={go(i.id)} aria-current={active === i.id ? "true" : undefined}
                className={cn("relative block rounded-full px-4 py-1.5 text-[.82rem] transition-colors",
                  active === i.id ? "text-ink" : "text-mute hover:text-fg")}>
                {active === i.id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-fg" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                {i.label}
              </a>
            </li>
          ))}
        </ul>
        {/* Mobile pill */}
        <div className="md:hidden">
          <button type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}
            className="flex min-h-11 items-center gap-3 rounded-full border border-line bg-ink/80 px-5 text-sm backdrop-blur-xl">
            <span className="size-1.5 rounded-full bg-lav" aria-hidden /> {current}
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className={cn("transition-transform", open && "rotate-180")}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          </button>
          <AnimatePresence>
            {open && (
              <motion.ul id="mobile-nav" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute left-1/2 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface/95 p-1.5 backdrop-blur-xl">
                {items.map((i) => (
                  <li key={i.id}>
                    <a href={`#${i.id}`} onClick={go(i.id)} className={cn("block rounded-xl px-4 py-3 text-sm", active === i.id ? "bg-raise text-fg" : "text-mute")}>{i.label}</a>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}
