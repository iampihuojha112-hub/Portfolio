import ProfileForm from "@/components/admin/ProfileForm";
import { requireAdminPage } from "@/lib/auth/admin";
import type { Profile } from "@/types";

export default async function ProfilePage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("profiles").select("*").eq("id", 1).single();
  return (
    <>
      <h1 className="font-display text-4xl">Profile</h1>
      <p className="mb-8 mt-2 text-mute">Name, tagline, introduction, about text and photograph. Social links live under Social Links.</p>
      <ProfileForm profile={data as Profile} />
    </>
  );
}
