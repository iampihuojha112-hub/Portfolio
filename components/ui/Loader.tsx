"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Short, skippable intro: at most ~1.4s, shorter when the page is already ready. */
export default function Loader({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduce ? 0 : 700;
    const started = performance.now();
    const finish = () => setTimeout(() => setDone(true), Math.max(0, min - (performance.now() - started)));
    const cap = setTimeout(() => setDone(true), 1400);
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    return () => { clearTimeout(cap); window.removeEventListener("load", finish); };
  }, []);
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <AnimatePresence>
      {!done && (
        <motion.div role="status" aria-label="Loading" className="fixed inset-0 z-[70] grid place-items-center bg-ink"
          exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="font-display text-5xl tracking-tight text-fg">
            {initials}<span className="text-lav">.</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
