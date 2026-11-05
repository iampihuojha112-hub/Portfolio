"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  ["/admin", "Overview"], ["/admin/profile", "Profile"], ["/admin/education", "Education"], ["/admin/skills", "Technical Skills"],
  ["/admin/projects", "Projects"], ["/admin/hackathons", "Hackathons"], ["/admin/certifications", "Certifications & Recognition"],
  ["/admin/beyond-coding", "Beyond Coding"], ["/admin/resume", "Resume"], ["/admin/social-links", "Social Links"],
  ["/admin/messages", "Messages"], ["/admin/settings", "Settings"],
] as const;

export default function Sidebar({ email, unread }: { email: string; unread: number }) {
  const path = usePathname();
  return (
    <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between p-5 lg:block">
        <div>
          <p className="font-display text-2xl">Portfolio<span className="text-lav">.</span></p>
          <p className="mt-1 truncate text-xs text-mute">{email}</p>
        </div>
      </div>
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-0.5 lg:pb-6">
        {LINKS.map(([href, label]) => {
          const active = href === "/admin" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={cn("flex shrink-0 items-center justify-between rounded-lg px-3 py-2 text-sm", active ? "bg-raise text-fg" : "text-mute hover:text-fg")}>
              {label}{label === "Messages" && unread > 0 && <span className="ml-2 rounded-full bg-lav px-1.5 text-[.65rem] font-bold text-ink">{unread}</span>}
            </Link>
          );
        })}
        <a href="/admin/preview" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg px-3 py-2 text-sm text-lav hover:underline">Preview site (with drafts) ↗</a>
        <a href="/" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg px-3 py-2 text-sm text-mute hover:text-fg">View public site ↗</a>
        <form action={signOut} className="shrink-0 lg:pt-4"><button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-mute hover:text-fg">Sign out</button></form>
      </nav>
    </aside>
  );
}
