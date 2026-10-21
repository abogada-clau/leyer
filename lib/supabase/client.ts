import { createBrowserClient } from "@supabase/ssr";

export function createClient(options?: { detectSessionInUrl?: boolean }) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    options
      ? { auth: { detectSessionInUrl: options.detectSessionInUrl } }
      : undefined,
  );
}
