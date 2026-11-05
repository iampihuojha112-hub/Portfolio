import Sidebar from "@/components/admin/Sidebar";
import { requireAdminPage } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdminPage();   // server-side authorization for every admin page
  const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false);
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar email={user.email ?? ""} unread={count ?? 0} />
      <main className="min-w-0 flex-1 p-5 md:p-10"><div className="mx-auto max-w-4xl">{children}</div></main>
    </div>
  );
}
