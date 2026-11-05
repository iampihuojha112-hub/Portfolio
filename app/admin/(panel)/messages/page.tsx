import MessagesList from "@/components/admin/MessagesList";
import { requireAdminPage } from "@/lib/auth/admin";
import type { ContactMessage } from "@/types";

export default async function MessagesPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("contact_messages").select("id,name,email,message,is_read,created_at").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <h1 className="font-display text-4xl">Messages</h1>
      <p className="mb-8 mt-2 text-mute">Messages sent through the contact form on your site. They are stored privately in your database.</p>
      <MessagesList messages={(data ?? []) as ContactMessage[]} />
    </>
  );
}
