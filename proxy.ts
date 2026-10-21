import { publicRouteRedirect } from "@/lib/public/redirects";
import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const publicRedirect = await publicRouteRedirect(request);
  return publicRedirect || (await updateSession(request));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
