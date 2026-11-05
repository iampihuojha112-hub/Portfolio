import Link from "next/link";
import PortfolioView from "@/components/PortfolioView";
import { requireAdminPage } from "@/lib/auth/admin";
import { fetchPortfolio } from "@/lib/database/public";

export const dynamic = "force-dynamic";

/** The real public page, rendered with the admin's session so drafts are included. Never cached. */
export default async function PreviewPage() {
  const { supabase } = await requireAdminPage();
  const data = await fetchPortfolio(supabase, true);
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[90] flex items-center justify-center gap-4 border-t border-amber-400/40 bg-ink/95 px-4 py-2 text-sm text-amber-200">
        Preview — includes drafts, not visible to visitors.
        <Link href="/admin" className="underline">Back to admin</Link>
      </div>
      <PortfolioView data={data} />
    </>
  );
}
