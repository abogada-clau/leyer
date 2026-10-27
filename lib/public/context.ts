import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { publicClient, result } from "./db";
import { publicPathValid, publicHref } from "./paths";
import type { PublicContext, PublicSite, PublicRouteData } from "./types";
export function hostName(raw: string) {
  try {
    if (/[\s/@\\#?]/.test(raw)) return null;
    return new URL(`http://${raw}`).hostname
      .toLowerCase()
      .replace(/^\[|\]$/g, "");
  } catch {
    return null;
  }
}
export function localHost(host: string) {
  return ["localhost", "127.0.0.1", "::1"].includes(host);
}
export async function resolveContext(
  rawHost: string,
  requestPath: string,
  protocol = "https:",
  mode: "site" | "route" | "page" = "site",
): Promise<PublicContext | null> {
  const host = hostName(rawHost);
  // URL pathnames arrive percent-encoded; decode UTF-8 once, never encoded separators.
  if (/%(?:2f|5c|23|3f)/i.test(requestPath)) return null;
  try {
    requestPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }
  if (!host || !publicPathValid(requestPath)) return null;
  const local = localHost(host);
  const parts = requestPath.split("/").filter(Boolean);
  if (parts[0] === "sitios") return null;
  let requestedLocale: string | null = null;
  if (parts[0] === "idioma") {
    if (!parts[1] || !/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(parts[1]))
      return null;
    requestedLocale = parts[1];
    parts.splice(0, 2);
  }
  const path = "/" + parts.join("/");
  const route: PublicRouteData | null = mode === "site"
    ? null
    : result(await publicClient().rpc("get_public_page", {
        p_path: path,
        p_locale: requestedLocale,
        p_details: mode === "page",
      }));
  const site: PublicSite | null = mode === "site"
    ? result(await publicClient().rpc("get_public_site"))
    : route?.site || null;
  if (!site || (!local && site.domain !== host)) return null;
  const locale = requestedLocale || site.default_locale;
  if (!route && locale !== site.default_locale) {
    const rows = result(
      await publicClient()
        .from("published_content")
        .select("id")
        .eq("site_id", site.id)
        .eq("locale", locale)
        .limit(1),
    );
    if (!rows?.length) return null;
  }
  // Request-local origin is never derived from untrusted forwarded-host headers.
  const origin = local
    ? `http://${rawHost}`
    : `${protocol === "http:" ? "http:" : "https:"}//${host}`;
  return { site, origin, locale, path, requestPath, local, ...(route ? { route } : {}) };
}
export const requestContext = cache(async (requestPath: string) => {
  await connection();
  const h = await headers();
  return resolveContext(h.get("host") || "", requestPath, "https:", "page");
});
export function canonicalUrl(
  c: PublicContext,
  path = c.path,
  locale = c.locale,
) {
  const origin = c.local ? c.origin : `https://${c.site.domain}`;
  return origin + publicHref(c, path, locale);
}
