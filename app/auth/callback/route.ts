import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const requested = params.get("next") || "/admin";
  const next =
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : "/admin";
  if (code) {
    const db = await createClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/auth/error?error=No%20se%20encontró%20el%20código%20de%20acceso.");
}
