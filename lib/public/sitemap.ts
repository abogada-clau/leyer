import "server-only";
import { sectionAvailable } from "./data";
import { resolveContext, canonicalUrl } from "./context";
import { publicClient, result } from "./db";
import { sitePath } from "./paths";
import type { PublicEntry, PublicContext } from "./types";
function xml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
export async function sitemapEntries(c: PublicContext) {
  const db = publicClient();
  const rows: PublicEntry[] = [];
  for (let offset = 0; offset < 100000; offset += 1000) {
    const page =
      result(
        await db
          .from("published_content")
          .select("*")
          .eq("site_id", c.site.id)
          .order("id")
          .range(offset, offset + 999),
      ) || [];
    rows.push(...(page as PublicEntry[]));
    if (page.length < 1000) break;
  }
  const urls: { url: string; modified?: string }[] = rows
    .filter((r) => r.seo.noindex !== true)
    .map((r) => ({
      url: canonicalUrl(c, r.path, r.locale),
      modified: r.first_published_at || undefined,
    }));
  const locales = [
    ...new Set([c.site.default_locale, ...rows.map((r) => r.locale)]),
  ];
  for (const locale of locales) {
    for (const path of [
      sitePath(c.site, "blog_path", "/articulos"),
      sitePath(c.site, "services_path", "/servicios"),
      sitePath(c.site, "team_path", "/equipo"),
    ])
      if (
        !rows.some(
          (r) =>
            r.locale === locale && r.path === path && r.seo.noindex === true,
        ) &&
        (await sectionAvailable({ ...c, locale }, path))
      )
        urls.push({ url: canonicalUrl(c, path, locale) });
    if (
      c.site.settings.contact_enabled === true &&
      (await sectionAvailable(
        { ...c, locale },
        sitePath(c.site, "contact_path", "/contacto"),
      )) &&
      !rows.some(
        (r) =>
          r.locale === locale &&
          r.path === sitePath(c.site, "contact_path", "/contacto") &&
          r.seo.noindex === true,
      ) &&
      rows.some(
        (r) =>
          r.locale === locale &&
          r.path === sitePath(c.site, "privacy_path", "/privacidad"),
      )
    )
      urls.push({
        url: canonicalUrl(
          c,
          sitePath(c.site, "contact_path", "/contacto"),
          locale,
        ),
      });
  }
  const authors =
    result(
      await db
        .from("authors")
        .select("id,slug,is_public")
        .eq("site_id", c.site.id),
    ) || [];
  for (const a of authors)
    for (const locale of locales)
      urls.push({
        url: canonicalUrl(c, `/autores/${encodeURIComponent(a.slug)}`, locale),
      });
  const terms =
    result(
      await db
        .from("terms")
        .select("id,slug,taxonomy_id")
        .eq("site_id", c.site.id),
    ) || [];
  const taxonomies =
    result(
      await db.from("taxonomies").select("id,code").eq("site_id", c.site.id),
    ) || [];
  for (const term of terms) {
    const tx = taxonomies.find((t) => t.id === term.taxonomy_id);
    if (!tx) continue;
    for (const locale of locales)
      urls.push({
        url: canonicalUrl(
          c,
          `/taxonomias/${encodeURIComponent(tx.code)}/${encodeURIComponent(term.slug)}`,
          locale,
        ),
      });
  }
  return [...new Map(urls.map((u) => [u.url, u])).values()];
}
export async function sitemapResponse(request: Request, path = "/") {
  const c = await resolveContext(request.headers.get("host") || "", path);
  if (!c) return new Response("Sitio no disponible", { status: 404 });
  const urls = await sitemapEntries(c);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${xml(u.url)}</loc>${u.modified ? `<lastmod>${xml(u.modified)}</lastmod>` : ""}</url>`).join("")}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
