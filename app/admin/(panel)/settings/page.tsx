import { requireAdminPage } from "@/lib/auth/admin";

const yes = <span className="text-emerald-300">configured</span>;
const no = <span className="text-red-300">missing</span>;

export default async function SettingsPage() {
  const { user } = await requireAdminPage();
  const env: [string, boolean][] = [
    ["NEXT_PUBLIC_SUPABASE_URL", !!process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ["NEXT_PUBLIC_SITE_URL", !!process.env.NEXT_PUBLIC_SITE_URL],
    ["CONTACT_HASH_SALT", !!process.env.CONTACT_HASH_SALT],
  ];
  return (
    <>
      <h1 className="font-display text-4xl">Settings</h1>
      <section className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Signed in as</h2>
        <p className="mt-2 text-mute">{user.email}</p>
        <p className="mt-4 text-sm text-mute">Admin access is controlled by the <code className="text-lav">public.admin_users</code> table in Supabase. To change who can sign in, edit that table in the Supabase SQL editor. Change your password from the Supabase dashboard (Authentication → Users).</p>
      </section>
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-lg font-semibold">Environment</h2>
        <ul className="mt-3 space-y-1 text-sm">{env.map(([k, ok]) => <li key={k}><code>{k}</code>: {ok ? yes : no}</li>)}</ul>
        <p className="mt-4 text-xs text-mute">Only presence is shown, never values. No service-role key is used or needed.</p>
      </section>
    </>
  );
}
