import { preparePublicRoute } from "@/lib/public/redirects";
import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return (await preparePublicRoute(request)) || (await updateSession(request));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
