"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/lib/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="mt-8 space-y-4 rounded-3xl border border-line bg-surface p-6">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-solid w-full">{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-xs text-mute">Access is limited to the site owner. There is no public sign-up.</p>
    </form>
  );
}
