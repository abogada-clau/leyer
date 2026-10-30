import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { publicClient, result } from "./db";
import type { Testimonial } from "@/lib/content/testimonials";

import type {
  PublicContext,
  PublicEntry,
  PublicDocument,
  PublicAsset,
  PublicAuthor,
  PublicTerm,
  PublicTaxonomy,
  Menu,
  MenuItem,
  RenderData,
} from "./types";

export async function publicTestimonials(siteId: string): Promise<Testimonial[]> {
  return result(await publicClient().from("testimonials").select("id,author_name,quote,context")
    .eq("site_id", siteId).eq("is_published", true).order("position").order("created_at").order("id")) || [];
}

export async function publicEntry(c: PublicContext, path = c.path) {
  if (c.route && path === c.path) return c.route.entry;
  return entryByPath(c.site.id, c.locale, path);
}
const entryByPath = cache(async (siteId: string, locale: string, path: string) => {
  return result(
    await publicClient()
      .from("published_content")
      .select("*")
      .eq("site_id", siteId)
      .eq("locale", locale)
      .eq("path", path)
      .maybeSingle(),
  ) as PublicEntry | null;
});
export async function publicRedirect(c: PublicContext) {
  if (c.route) return c.route.redirect;
  const row = result(
    await publicClient()
      .from("redirects")
      .select("target_entry_id,status_code")
      .eq("site_id", c.site.id)
      .eq("locale", c.locale)
      .eq("from_path", c.path)
      .maybeSingle(),
  );
  if (!row) return null;
  const target = result(
    await publicClient()
      .from("published_content")
      .select("path")
      .eq("site_id", c.site.id)
      .eq("locale", c.locale)
      .eq("id", row.target_entry_id)
      .maybeSingle(),
  );
  return target && target.path !== c.path
    ? { path: target.path, status: row.status_code as 301 | 308 }
    : null;
}
/** Cache only after live route/publication resolution. Old snapshots become unreachable on unpublish. */
export async function snapshotData(
  siteId: string,
  entryId: string,
  revisionId: string,
): Promise<RenderData | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`cms-site:${siteId}`, `cms-entry:${entryId}`);
  const db = publicClient();
  const document = result(
    await db.rpc("get_public_snapshot", { p_revision_id: revisionId }),
  ) as PublicDocument | null;
  if (!document || document.site_id !== siteId || document.id !== entryId)
    return null;
  const assetIds = [
    document.cover_asset_id,
    ...document.blocks.flatMap((b) => b.assets.map((a) => a.asset_id)),
  ].filter(Boolean) as string[];
  const authors = document.authors.length
    ? (result(
        await db
          .from("authors")
          .select("*")
          .eq("site_id", siteId)
          .in("id", document.authors),
      ) as PublicAuthor[])
    : [];
  assetIds.push(
    ...(authors.map((a) => a.avatar_asset_id).filter(Boolean) as string[]),
  );
  const [media, terms, taxonomies] = await Promise.all([
    assetIds.length
      ? db
          .from("media_assets")
          .select(
            "id,site_id,bucket_id,storage_path,mime_type,byte_size,width,height,alt_text,credits",
          )
          .eq("site_id", siteId)
          .eq("bucket_id", "cms-public")
          .in("id", [...new Set(assetIds)])
      : Promise.resolve({ data: [], error: null }),
    document.terms.length
      ? db
          .from("terms")
          .select("id,taxonomy_id,name,slug,parent_id")
          .eq("site_id", siteId)
          .in("id", document.terms)
      : Promise.resolve({ data: [], error: null }),
    document.terms.length
      ? db.from("taxonomies").select("id,code,name").eq("site_id", siteId)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const assets = (result(media) || []).map((a) => ({
    ...a,
    src: db.storage.from("cms-public").getPublicUrl(a.storage_path).data
      .publicUrl,
  })) as PublicAsset[];
  return {
    document,
    assets,
    authors: authors.sort(
      (a, b) => document.authors.indexOf(a.id) - document.authors.indexOf(b.id),
    ),
    terms: (result(terms) || []) as PublicTerm[],
    taxonomies: (result(taxonomies) || []) as PublicTaxonomy[],
  };
}
/** Resolve visibility live in one query; cached snapshots must not resurrect withdrawn relations. */
export async function relatedEntries(c: PublicContext, ids: string[]) {
  if (!ids.length) return [];
  const entries = (result(
    await publicClient()
      .from("published_content")
      .select("*")
      .eq("site_id", c.site.id)
      .eq("locale", c.locale)
      .in("id", [...new Set(ids)]),
  ) || []) as PublicEntry[];
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  return ids.flatMap(id => byId.has(id) ? [byId.get(id)!] : []);
}
export async function navigation(siteId: string, locale: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`cms-site:${siteId}`);
  const db = publicClient();
  const menus = (result(
    await db
      .from("menus")
      .select("id,code,name,locale")
      .eq("site_id", siteId)
      .eq("locale", locale)
      .eq("is_public", true),
  ) || []) as Menu[];
  const items = menus.length
    ? ((result(
        await db
          .from("menu_items")
          .select("id,menu_id,parent_id,label,position,entry_id,external_url")
          .eq("site_id", siteId)
          .in(
            "menu_id",
            menus.map((m) => m.id),
          )
          .order("position")
          .order("id"),
      ) || []) as MenuItem[])
    : [];
  const ids = items.map((i) => i.entry_id).filter(Boolean) as string[];
  const entries = ids.length
    ? ((result(
        await db
          .from("published_content")
          .select("*")
          .eq("site_id", siteId)
          .eq("locale", locale)
          .in("id", ids),
      ) || []) as PublicEntry[])
    : [];
  return { menus, items, entries };
}
export async function listEntries(
  c: PublicContext,
  options: {
    kind?: string;
    q?: string;
    page?: number;
    termId?: string;
    authorId?: string;
  } = {},
) {
  const page = Math.max(1, Math.min(100000, Math.floor(options.page || 1)));
  const validId = (id: string | undefined) =>
    !id ||
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
  if (!validId(options.termId) || !validId(options.authorId))
    return { rows: [], total: 0, page };
  const data = result(
    await publicClient().rpc("list_published_content", {
      p_site_id: c.site.id,
      p_locale: c.locale,
      p_kind: options.kind || null,
      p_query: options.q?.slice(0, 200) || "",
      p_term_id: options.termId || null,
      p_author_id: options.authorId || null,
      p_page: page,
    }),
  ) as { rows: PublicEntry[]; total: number };
  return { rows: data.rows, total: data.total, page };
}
export async function authorData(c: PublicContext, slug?: string) {
  return authorsBySlug(c.site.id, slug);
}
const authorsBySlug = cache(async (siteId: string, slug?: string) => {
  let query = publicClient()
    .from("authors")
    .select("*")
    .eq("site_id", siteId);
  if (slug) query = query.eq("slug", slug);
  else query = query.eq("is_public", true);
  return (result(await query.order("display_name")) || []) as PublicAuthor[];
});
export async function publicAssets(siteId: string, ids: string[]) {
  if (!ids.length) return [];
  return assetsByIds(siteId, [...new Set(ids)].sort().join(","));
}
const assetsByIds = cache(async (siteId: string, ids: string) => {
  const db = publicClient();
  return (
    result(
      await db
        .from("media_assets")
        .select(
          "id,site_id,bucket_id,storage_path,mime_type,byte_size,width,height,alt_text,credits",
        )
        .eq("site_id", siteId)
        .eq("bucket_id", "cms-public")
        .in("id", ids.split(",")),
    ) || []
  ).map((a) => ({
    ...a,
    src: db.storage.from("cms-public").getPublicUrl(a.storage_path).data
      .publicUrl,
  })) as PublicAsset[];
});
export async function publicLocales(siteId: string) {
  const rows = result(
    await publicClient()
      .from("published_content")
      .select("locale")
      .eq("site_id", siteId),
  );
  return [...new Set((rows || []).map((r) => String(r.locale)))].sort();
}

export async function sectionAvailable(c: PublicContext, path = c.path) {
  if (c.route && path === c.path) return c.route.available;
  return sectionByPath(c.site.id, c.locale, path);
}
const sectionByPath = cache(async (siteId: string, locale: string, path: string) => {
  return (
    result(
      await publicClient().rpc("public_section_available", {
        p_site_id: siteId,
        p_locale: locale,
        p_path: path,
      }),
    ) === true
  );
});
