"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMessage, setMessageRead } from "@/lib/actions/messages";
import type { ContactMessage } from "@/types";

export default function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });
  if (!messages.length) return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-mute">No messages yet.</p>;
  return (
    <ul className="space-y-3" aria-busy={pending}>
      {messages.map((m) => (
        <li key={m.id} className={`rounded-2xl border p-5 ${m.is_read ? "border-line bg-surface" : "border-lav/50 bg-surface"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{m.name} <a className="ml-2 text-sm text-lav hover:underline" href={`mailto:${m.email}`}>{m.email}</a></p>
            <time className="text-xs text-mute" dateTime={m.created_at}>{new Date(m.created_at).toLocaleString("en-IN")}</time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-fg/90">{m.message}</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn !min-h-9" onClick={() => run(() => setMessageRead(m.id, !m.is_read))}>{m.is_read ? "Mark unread" : "Mark read"}</button>
            <button type="button" className="btn !min-h-9 hover:!border-red-400" onClick={() => confirm("Delete this message?") && run(() => deleteMessage(m.id))}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
