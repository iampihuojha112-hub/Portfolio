"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { publicUrl, isPdfPath } from "@/lib/storage";

export interface LightboxItem { path: string; title?: string | null }

/** Accessible modal preview for images and PDFs: Esc closes, arrows navigate, focus is trapped and restored. */
export default function Lightbox({ items, index, onClose, onIndex }:
  { items: LightboxItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null && items[index] !== undefined;
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const step = useCallback((d: number) => {
    if (index === null) return;
    onIndex((index + d + items.length) % items.length);
  }, [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href], iframe");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      returnFocus.current?.focus();
    };
  }, [open, onClose, step]);

  const item = open ? items[index!] : null;
  const url = item ? publicUrl(item.path) : null;
  return (
    <AnimatePresence>
      {item && url && (
        <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-label={item.title || "Preview"} tabIndex={-1}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95 p-4 backdrop-blur-sm md:p-8" onClick={onClose}>
          <div className="mb-3 flex items-center justify-between gap-4" onClick={(e) => e.stopPropagation()}>
            <p className="truncate text-sm text-mute">{item.title || ""} {items.length > 1 && <span>({index! + 1}/{items.length})</span>}</p>
            <div className="flex gap-2">
              {isPdfPath(item.path) && <a className="btn !min-h-10" href={url} target="_blank" rel="noopener noreferrer">Open PDF</a>}
              <button type="button" className="btn !min-h-10" onClick={onClose} aria-label="Close preview">Close</button>
            </div>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
            {isPdfPath(item.path)
              ? <iframe src={url} title={item.title || "PDF preview"} className="size-full rounded-lg bg-white" />
              : <Image src={url} alt={item.title || "Enlarged preview"} fill sizes="100vw" className="object-contain" />}
            {items.length > 1 && (<>
              <button type="button" aria-label="Previous" onClick={() => step(-1)} className="btn absolute left-0 top-1/2 -translate-y-1/2 !px-3 bg-ink/70">‹</button>
              <button type="button" aria-label="Next" onClick={() => step(1)} className="btn absolute right-0 top-1/2 -translate-y-1/2 !px-3 bg-ink/70">›</button>
            </>)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
