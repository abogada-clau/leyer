import { notFound } from "next/navigation";
import { requireSite, checked } from "@/lib/admin/server";
import type { Entry, Snapshot, Row } from "@/lib/admin/types";
import { ContentEditor } from "@/components/admin/content-editor";
export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db, site, user } = await requireSite();
  const found = checked(
    await db.rpc("get_cms_listing", { p_site_id: site.id }).eq("id", id),
  );
  const entry = found?.[0] as Entry | undefined;
  if (!entry) notFound();
  const entries = (checked(
    await db
      .rpc("get_cms_listing", { p_site_id: site.id })
      .order("internal_name")
      .limit(1000),
  ) || []) as Entry[];
  const results = await Promise.all([
    db
      .rpc("get_cms_revisions", { p_entry_id: id })
      .order("revision_number", { ascending: false })
      .limit(20),
    db.from("authors").select("*").eq("site_id", site.id).order("display_name"),
    db.from("terms").select("*").eq("site_id", site.id).order("name"),
    db.from("taxonomies").select("*").eq("site_id", site.id),
    db
      .from("scheduled_publications")
      .select("*")
      .eq("site_id", site.id)
      .eq("entry_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const [revisions, authors, terms, taxonomies, schedules] = results.map(
    (r) => checked(r) || [],
  );
  const snapshot: Snapshot = revisions[0]
    ? checked(
        await db.rpc("get_cms_snapshot", { p_revision_id: revisions[0].id }),
      )
    : {
        title: "",
        excerpt: "",
        path: "/",
        cover_asset_id: null,
        template_key: "default",
        template_version: 1,
        seo: {},
        blocks: [],
        authors: [],
        terms: [],
        relations: [],
      };
  const menuLinks = snapshot.template_key === "service-landing" && snapshot.template_version < 2
    ? checked(await db.from("menu_items").select("external_url").eq("site_id", site.id)) || [] : [];
  const serviceDefaults = {
    contactPath: site.settings.contact_enabled === true ? String(site.settings.contact_path || "/contacto") : undefined,
    whatsappHref: menuLinks.map(item => item.external_url).find(href => typeof href === "string" && /^https:\/\/wa\.me\/\d{8,15}$/.test(href)) || undefined,
  };
  return (
    <ContentEditor
      key={`${id}-${site.id}`}
      entry={entry}
      initial={snapshot}
      userId={user.id}
      permissions={site.permissions}
      entries={entries}
      authors={authors as Row[]}
      terms={terms as Row[]}
      taxonomies={taxonomies as Row[]}
      revisions={revisions as Row[]}
      schedules={schedules as Row[]}
      serviceDefaults={serviceDefaults}
    />
  );
}
