import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSite, checked, type Search } from "@/lib/admin/server";
import type { PublicEntry } from "@/lib/public/types";
import type { Entry, Asset, Row, Snapshot } from "@/lib/admin/types";
import { ContentPreview } from "@/components/admin/content-preview";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Testimonial } from "@/lib/content/testimonials";
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Search;
}) {
  const { id } = await params;
  const p = await searchParams;
  const { db, site } = await requireSite();
  const found = checked(
    await db.rpc("get_cms_listing", { p_site_id: site.id }).eq("id", id),
  );
  const entry = found?.[0] as Entry | undefined;
  if (!entry) notFound();
  const entries = (checked(
    await db.rpc("get_cms_listing", { p_site_id: site.id }),
  ) || []) as Entry[];
  const revisionId = String(p.revision || entry.revision_id || "");
  if (!revisionId)
    return <Alert title="Guarda una revisión para previsualizar." />;
  const snapshot = checked(
    await db.rpc("get_cms_snapshot", { p_revision_id: revisionId }),
  );
  if (
    !snapshot ||
    snapshot.entry_id !== entry.id ||
    snapshot.site_id !== site.id
  )
    notFound();
  const [media, authors, publicEntries, testimonials] = await Promise.all([
    db.rpc("get_cms_media", { p_site_id: site.id }),
    db.from("authors").select("*").eq("site_id", site.id),
    db
      .from("published_content")
      .select("*")
      .eq("site_id", site.id)
      .eq("locale", entry.locale)
      .order("first_published_at", { ascending: false }),
    snapshot.blocks.some((b: { type: string }) => b.type === "testimonials") ? db.from("testimonials").select("id,author_name,quote,context").eq("site_id", site.id).eq("is_published", true).order("position").order("created_at").order("id") : Promise.resolve({ data: [], error: null }),
  ]);
  return (
    <div className="space-y-8">
      <Alert title="Previsualización privada">
        Revisión {snapshot.revision_number}. Esta página requiere los permisos
        actuales del CMS.{" "}
        <Button asChild variant="link" size="sm">
          <Link href={`/admin/content/${entry.id}`}>Volver al editor</Link>
        </Button>
      </Alert>
      <ContentPreview
        testimonialItems={(checked(testimonials) || []) as Testimonial[]}
        publishedEntries={(checked(publicEntries) || []) as PublicEntry[]}
        snapshot={snapshot as Snapshot}
        entries={entries}
        assets={(checked(media) || []) as Asset[]}
        authors={(checked(authors) || []) as Row[]}
      />
    </div>
  );
}
