import "server-only";
import { headers } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { publicClient, result } from "./db";
import { publicPathValid, publicHref } from "./paths";
import type { PublicContext, PublicSite } from "./types";
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
  let basePath = "";
  let site: PublicSite | null;
  if (parts[0] === "sitios") {
    if (
      !local ||
      process.env.ENABLE_LOCAL_SITES !== "true" ||
      !parts[1] ||
      !parts[2]
    )
      return null;
    site = result(
      await publicClient().rpc("resolve_public_site", {
        p_domain: null,
        p_organization_slug: parts[1],
        p_site_slug: parts[2],
      }),
    );
    basePath = `/sitios/${parts[1]}/${parts[2]}`;
    parts.splice(0, 3);
  } else if (local) {
    const selection = (process.env.LOCAL_PUBLIC_SITE || "").split("/");
    if (selection.length !== 2) return null;
    site = result(
      await publicClient().rpc("resolve_public_site", {
        p_domain: null,
        p_organization_slug: selection[0],
        p_site_slug: selection[1],
      }),
    );
  } else
    site = result(
      await publicClient().rpc("resolve_public_site", {
        p_domain: host,
        p_organization_slug: null,
        p_site_slug: null,
      }),
    );
  if (!site) return null;
  let locale = site.default_locale;
  if (parts[0] === "idioma") {
    if (!parts[1] || !/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(parts[1]))
      return null;
    locale = parts[1];
    parts.splice(0, 2);
  }
  if (locale !== site.default_locale) {
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
  const path = "/" + parts.join("/");
  // Request-local origin is never derived from untrusted forwarded-host headers.
  const origin = local
    ? `http://${rawHost}`
    : `${protocol === "http:" ? "http:" : "https:"}//${host}`;
  return { site, basePath, origin, locale, path, requestPath, local };
}
export const requestContext = cache(async (requestPath: string) => {
  await connection();
  const h = await headers();
  return resolveContext(h.get("host") || "", requestPath);
});
export function canonicalUrl(
  c: PublicContext,
  path = c.path,
  locale = c.locale,
) {
  const origin = c.local ? c.origin : `https://${c.site.domain}`;
  return origin + publicHref(c, path, locale);
}
