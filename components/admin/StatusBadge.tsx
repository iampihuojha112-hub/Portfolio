import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "border-emerald-400/40 text-emerald-300", draft: "border-amber-400/40 text-amber-300", archived: "border-line text-mute",
  };
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-[.7rem] font-semibold uppercase tracking-wider", map[status] ?? map.archived)}>{status}</span>;
}
