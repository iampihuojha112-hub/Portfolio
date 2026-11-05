import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { getOverview } from "@/lib/database/admin";
import { formatDate } from "@/lib/utils";

const HREF: Record<string, string> = {
  projects: "/admin/projects", hackathons: "/admin/hackathons", certifications: "/admin/certifications",
  interests: "/admin/beyond-coding", education: "/admin/education",
};

export default async function Overview() {
  const { supabase } = await requireAdminPage();
  const o = await getOverview(supabase);
  const stats = [
    ["Published projects", o.publishedProjects], ["Hackathon entries", o.hackathons],
    ["Certificates", o.certificates], ["Draft entries", o.drafts],
  ] as const;
  return (
    <>
      <h1 className="font-display text-4xl">Overview</h1>
      <p className="mt-2 text-mute">Live counts from your database.</p>
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-5">
            <dt className="eyebrow">{label}</dt><dd className="font-display mt-2 text-5xl">{n}</dd>
          </div>
        ))}
      </dl>
      {o.unreadMessages > 0 && <Link href="/admin/messages" className="btn mt-6">{o.unreadMessages} unread message{o.unreadMessages > 1 ? "s" : ""} →</Link>}
      <h2 className="font-display mt-12 text-2xl">Recently updated</h2>
      {o.recent.length === 0 ? <p className="mt-3 text-mute">Nothing yet.</p> : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {o.recent.map((r, i) => (
            <li key={i}><Link href={HREF[r.table] ?? "/admin"} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-raise">
              <span className="truncate">{r.title}<span className="ml-2 text-xs text-mute">{r.label}</span></span>
              <span className="shrink-0 text-xs text-mute">{formatDate(r.updated_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </>
  );
}
