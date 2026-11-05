import ResumeManager from "@/components/admin/ResumeManager";
import { requireAdminPage } from "@/lib/auth/admin";
import type { Resume } from "@/types";

export default async function ResumePage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
  return (
    <>
      <h1 className="font-display text-4xl">Resume</h1>
      <p className="mb-8 mt-2 text-mute">The public “Download Resume” button always serves the one marked Current, at the stable link <code className="text-lav">/resume</code>.</p>
      <ResumeManager resumes={(data ?? []) as Resume[]} />
    </>
  );
}
