import "server-only";
import { createClient } from "@supabase/supabase-js";
/** Anonymous even for signed-in administrators: public requests cannot read drafts. */
export function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
export function result<T>(r: {
  data: T;
  error: { message: string } | null;
}): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}
