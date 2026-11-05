import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/admin";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminContext()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center">Private area</p>
        <h1 className="font-display mt-3 text-center text-4xl">Admin sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
