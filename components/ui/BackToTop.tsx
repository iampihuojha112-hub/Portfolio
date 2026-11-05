"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { scrollToTop } from "@/lib/scroll-store";

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 1.2);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button type="button" aria-label="Back to top" onClick={scrollToTop}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full border border-line bg-surface/90 text-fg backdrop-blur hover:border-lav">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 13V3m0 0L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
