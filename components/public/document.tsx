import Link from "next/link";
import { getImageProps } from "next/image";
import { cache, Suspense, type ReactNode } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { ContentBlocks } from "./content-blocks";
import { ContactSection } from "./contact-section";
import { EntryCards } from "./entry-cards";
import { Team } from "./team";
import { publicHref, contentLink } from "@/lib/public/paths";
import { documentLayout } from "@/lib/public/document-layout";
import { authorData, listEntries, sectionAvailable, relatedEntries, publicTestimonials } from "@/lib/public/data";
import type { PublicAsset, PublicContext, PublicEntry, RenderData } from "@/lib/public/types";
export async function PublicDocumentView({
  data,
  context: c,
  contactHref,
  whatsapp,
  privacy,
  serviceForm,
  beforeBlocks,
}: {
  data: RenderData;
  context: PublicContext;
  contactHref?: string;
  whatsapp?: string;
  privacy: PublicEntry | null;
  serviceForm: boolean;
  beforeBlocks?: ReactNode;
}) {
  const doc = data.document;
  const { knownTemplate, serviceLayout, hero } = documentLayout(doc);
  const heroTitle = Boolean(hero);
  const heroAssetIds = new Set(hero?.assets.map(asset => asset.asset_id));
  const homeNavigation = knownTemplate && doc.template_key === "home";
  const serviceFormsEnabled = serviceLayout && serviceForm;
  const [overview, testimonialItems] = await Promise.all([
    homeNavigation ? Promise.all([
      { path: "/personas", label: "Todas las áreas para personas" },
      { path: "/empresas", label: "Todas las áreas para empresas" },
    ].map(async item => await sectionAvailable(c, item.path) ? { href: publicHref(c, item.path), label: item.label } : null)) : [],
    doc.blocks.some(b => b.type === "testimonials" && b.data.hidden !== true) ? publicTestimonials(c.site.id) : [],
  ]);
  const assets = new Map(data.assets.map(asset => [asset.id, asset]));
  const cover = assets.get(doc.cover_asset_id || "");
  const overviewLinks = overview.flatMap(item => item ? [item] : []);
  const heroWhatsApp = serviceFormsEnabled ? contentLink(c, whatsapp) ?? undefined : undefined;
  const relationIds = doc.relations.map(relation => relation.entry_id);
  const serviceContact = serviceFormsEnabled ? (
      <ContactSection
        context={c}
        entryId={doc.id}
        privacy={privacy}
        whatsapp={whatsapp}
        subject={doc.title.trim().length >= 2 ? doc.title : "Consulta sobre este servicio"}
        compact={heroTitle}
      />
    ) : undefined;
  return (
    <article
      className={`public-document template-${knownTemplate ? doc.template_key : "default"}`}
    >
      {!heroTitle && (
        <header
          className={`public-document-heading ${doc.kind === "post" ? "article-heading" : ""}`}
        >
          <p className="public-eyebrow">
            {doc.kind === "post"
              ? "Ideas para comprender mejor"
              : doc.kind === "landing"
                ? "Áreas de práctica"
                : "Nuestro estudio"}
          </p>
          <h1 className="font-editorial">{doc.title}</h1>
          {doc.excerpt && <p className="public-lead">{doc.excerpt}</p>}
          {doc.kind === "post" && (
            <div className="public-byline">
              {data.authors.map((a) => (
                <Link
                  key={a.id}
                  href={publicHref(c, `/autores/${encodeURIComponent(a.slug)}`)}
                >
                  {a.display_name}
                </Link>
              ))}
              {doc.first_published_at && (
                <time dateTime={doc.first_published_at}>
                  {new Intl.DateTimeFormat(c.locale, {
                    dateStyle: "long",
                    timeZone: "America/Santiago",
                  }).format(new Date(doc.first_published_at))}
                </time>
              )}
            </div>
          )}
          {data.terms.length > 0 && (
            <ul className="public-term-links">
              {data.terms.map((t) => {
                const tx = data.taxonomies.find(
                  (tx) => tx.id === t.taxonomy_id,
                );
                return (
                  tx && (
                    <li key={t.id}>
                      <Link
                        href={publicHref(
                          c,
                          `/taxonomias/${encodeURIComponent(tx.code)}/${encodeURIComponent(t.slug)}`,
                        )}
                      >
                        {t.name}
                      </Link>
                    </li>
                  )
                );
              })}
            </ul>
          )}
          {cover && cover.mime_type.startsWith("image/") && (
            <MediaImage
              src={cover.src}
              alt={cover.alt_text}
              width={cover.width || 1600}
              height={cover.height || 900}
              loading="eager"
            />
          )}
        </header>
      )}
      {beforeBlocks}
      <ContentBlocks
        blocks={doc.blocks}
        testimonialItems={testimonialItems}
        firstHeroAsTitle={heroTitle}
        contactHref={contactHref}
        homeNavigation={homeNavigation}
        serviceLayout={serviceLayout}
        heroContact={heroTitle ? serviceContact : undefined}
        heroWhatsApp={heroWhatsApp}
        overviewLinks={overviewLinks}
        link={(href) => contentLink(c, href)}
        image={(id, alt, focal) => {
          const a = assets.get(id);
          if (!a) return null;
          if (a.mime_type === "application/pdf")
            return (
              <a
                className="public-download"
                href={a.src}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir documento PDF público
              </a>
            );
          const point =
            focal && typeof focal === "object" && !Array.isArray(focal)
              ? focal
              : null;
          const hero = heroAssetIds.has(id);
          const width = a.width || 1600;
          const height = a.height || 1000;
          const sizes = serviceFormsEnabled
            ? "(max-width: 740px) min(460px, calc(100vw - 88px)), (max-width: 980px) 360px, 320px"
            : "(max-width: 740px) calc(100vw - 88px), 560px";
          const responsive = serviceLayout && hero && a.src.startsWith("https://") &&
            /^image\/(webp|jpeg|png|avif)$/.test(a.mime_type)
            ? getImageProps({ src: a.src, alt: alt || a.alt_text, width, height, sizes }).props
            : null;
          return (
            <MediaImage
              src={a.src}
              srcSet={responsive?.srcSet}
              sizes={responsive?.sizes}
              alt={alt || a.alt_text}
              width={width}
              height={height}
              imageClassName="public-block-image"
              loading={hero ? "eager" : "lazy"}
              fetchPriority={hero ? "high" : undefined}
              fit="cover"
              imageStyle={
                point
                  ? {
                      objectPosition: `${Math.max(0, Math.min(1, Number.isFinite(Number(point.x)) ? Number(point.x) : 0.5)) * 100}% ${Math.max(0, Math.min(1, Number.isFinite(Number(point.y)) ? Number(point.y) : 0.5)) * 100}%`,
                    }
                  : undefined
              }
            />
          );
        }}
        related={(b) => (
          <Suspense fallback={null}>
            <PublishedRelated context={c} source={b.data.source} relationIds={relationIds} assets={assets} />
          </Suspense>
        )}
      />
      {!heroTitle && serviceContact}
      {doc.kind === "post" && relationIds.length > 0 && !doc.blocks.some((b) => b.type === "related_content") && (
        <Suspense fallback={null}>
          <PublishedRelated context={c} relationIds={relationIds} assets={assets} footer />
        </Suspense>
      )}
    </article>
  );
}

async function PublishedRelated({ context, source, relationIds, assets, footer }: {
  context: PublicContext;
  source?: unknown;
  relationIds: string[];
  assets: ReadonlyMap<string, PublicAsset>;
  footer?: boolean;
}) {
  if (source === "team") {
    const team = await authorData(context);
    return team.length
      ? <Team context={context} authors={team.slice(0, 3)} />
      : <p className="public-empty">El equipo aún no tiene perfiles públicos.</p>;
  }
  const kind = source === "posts" ? "post" : source === "services" ? "landing" : null;
  const entries = await publishedRelatedEntries(context, kind, relationIds);
  if (!footer) return <EntryCards context={context} entries={entries} knownAssets={assets} />;
  return entries.length > 0 && (
    <section className="public-related-footer">
      <h2 className="font-editorial">Sigue leyendo</h2>
      <EntryCards context={context} entries={entries} knownAssets={assets} />
    </section>
  );
}

const publishedRelatedEntries = cache(async (context: PublicContext, kind: "post" | "landing" | null, relationIds: string[]) => {
  if (!kind) return relatedEntries(context, relationIds);
  return (await listEntries(context, { kind })).rows.slice(0, 3);
});
