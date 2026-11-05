import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

export default function SectionHeading({ index, label, title, tone = "dark", className }:
  { index: string; label: string; title: string; tone?: "dark" | "light"; className?: string }) {
  return (
    <Reveal className={cn("mb-12 md:mb-16", className)}>
      <p className={cn("eyebrow flex items-center gap-3", tone === "light" && "!text-cocoa/60")}>
        <span className={tone === "light" ? "text-clay" : "text-lav"}>{index}</span>
        <span aria-hidden className={cn("h-px w-10", tone === "light" ? "bg-cocoa/30" : "bg-line")} />
        {label}
      </p>
      <h2 className="font-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] tracking-tight md:text-6xl">{title}</h2>
    </Reveal>
  );
}
