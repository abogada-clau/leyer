import { NextResponse, type NextRequest } from "next/server";
import { resolveContext } from "./context";
import { publicEntry, publicRedirect, sectionAvailable } from "./data";
import { publicHref, sitePath } from "./paths";
import { publicMissing } from "./missing";
import { publicRouteHeader, signPublicRoute } from "./route-context";
/** Resolve status before rendering, so a streamed metadata boundary cannot turn a 404 into HTTP 200. */
export async function preparePublicRoute(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/site-unavailable") return publicMissing();
  if (
    /^\/(admin|auth|api|protected|design-system|_next)(\/|$)/i.test(path) ||
    /^\/(sitemap\.xml|robots\.txt|icon\.svg)$/.test(path) ||
    path === "/images/design-system-sample.webp" ||
    path === "/images/albar-logo.webp" ||
    path === "/images/albar-logo-hd.webp" ||
    path === "/images/albar-diosa-justicia.webp"
  )
    return null;
  try {
    const host = request.headers.get("host") || "";
    const c = await resolveContext(host, path, "https:", "page");
    if (!c) return publicMissing(c);
    const redirect = await publicRedirect(c);
    if (redirect) {
      const destination = new URL(publicHref(c, redirect.path), c.origin);
      destination.search = request.nextUrl.search;
      return NextResponse.redirect(destination, { status: redirect.status });
    }
    const canonical = publicHref(c, c.path);
    if (new URL(canonical, c.origin).pathname !== path) {
      const url = new URL(canonical, c.origin);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, { status: 308 });
    }
    // Share the live lookup with the renderer after checking the status and canonical path.
    const headers = new Headers(request.headers);
    headers.delete(publicRouteHeader);
    const signedRoute = signPublicRoute(host, c);
    if (signedRoute) headers.set(publicRouteHeader, signedRoute);
    const next = () => NextResponse.next({ request: { headers } });
    if (await publicEntry(c)) return next();
    if (!(await sectionAvailable(c))) return publicMissing(c);
    if (
      [
        sitePath(c.site, "blog_path", "/articulos"),
        sitePath(c.site, "services_path", "/servicios"),
        sitePath(c.site, "team_path", "/equipo"),
      ].includes(c.path)
    )
      return next();
    if (
      c.path === sitePath(c.site, "contact_path", "/contacto") &&
      c.site.settings.contact_enabled === true
    )
      return next();
    const parts = c.path.split("/");
    if (parts[1] === "autores" && parts.length === 3) {
      return c.route?.author ? next() : publicMissing(c);
    }
    if (parts[1] === "taxonomias" && parts.length === 4) {
      return c.route?.term ? next() : publicMissing(c);
    }
    return publicMissing(c);
  } catch {
    return null;
  }
}
