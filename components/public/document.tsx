import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { ContentBlocks } from "./content-blocks";
import { EntryCards } from "./entry-cards";
import { Team } from "./team";
import { publicHref, contentLink, sitePath } from "@/lib/public/paths";
import { authorData, listEntries, sectionAvailable, relatedEntries } from "@/lib/public/data";
import type { PublicContext, RenderData } from "@/lib/public/types";
export async function PublicDocumentView({
  data,
  context: c,
}: {
  data: RenderData;
  context: PublicContext;
}) {
  const doc = data.document;
  const knownTemplate =
    [
      "default",
      "home",
      "service-landing",
      "article",
      "contact",
      "team",
      "blog-index",
      "services-index",
      "legal",
    ].includes(doc.template_key) && (doc.template_version === 1 || (doc.template_key === "service-landing" && doc.template_version === 2));
  const serviceLayout = knownTemplate && doc.template_key === "service-landing";
  const heroTitle =
    knownTemplate &&
    ["home", "service-landing", "default"].includes(doc.template_key) &&
    doc.blocks.filter(block => block.data.hidden !== true)[0]?.type === "hero" &&
    doc.blocks.filter(block => block.data.hidden !== true)[0]?.schema_version === 1;
  const heroAssetIds = new Set(heroTitle
    ? doc.blocks.find(block => block.data.hidden !== true)?.assets.map(asset => asset.asset_id)
    : []);
  const sources = new Set(
    doc.blocks
      .filter((b) => b.type === "related_content" && b.data.hidden !== true && b.schema_version === 1)
      .map((b) => String(b.data.source || "related")),
  );
  const usesRelations = [...sources].some(source => !["posts", "services", "team"].includes(source)) ||
    (doc.kind === "post" && !doc.blocks.some(block => block.type === "related_content"));
  const contactPath = sitePath(c.site, "contact_path", "/contacto");
  const homeNavigation = knownTemplate && doc.template_key === "home";
  const [posts, services, team, liveRelated, contactReady, overview] = await Promise.all([
    sources.has("posts") ? listEntries(c, { kind: "post" }) : null,
    sources.has("services") ? listEntries(c, { kind: "landing" }) : null,
    sources.has("team") ? authorData(c) : null,
    usesRelations ? relatedEntries(c, doc.relations.map(r => r.entry_id)) : [],
    c.site.settings.contact_enabled === true ? sectionAvailable(c, contactPath) : false,
    homeNavigation ? Promise.all([
      { path: "/personas", label: "Todas las áreas para personas" },
      { path: "/empresas", label: "Todas las áreas para empresas" },
    ].map(async item => await sectionAvailable(c, item.path) ? { href: publicHref(c, item.path), label: item.label } : null)) : [],
  ]);
  const asset = (id: string) => data.assets.find((a) => a.id === id);
  const cover = asset(doc.cover_asset_id || "");
  const contactHref = contactReady ? publicHref(c, contactPath) : undefined;
  const overviewLinks = overview.flatMap(item => item ? [item] : []);
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
      <ContentBlocks
        blocks={doc.blocks}
        firstHeroAsTitle={heroTitle}
        contactHref={contactHref}
        homeNavigation={homeNavigation}
        serviceLayout={serviceLayout}
        overviewLinks={overviewLinks}
        link={(href) => contentLink(c, href)}
        image={(id, alt, focal) => {
          const a = asset(id);
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
          return (
            <MediaImage
              src={a.src}
              alt={alt || a.alt_text}
              width={a.width || 1600}
              height={a.height || 1000}
              imageClassName="public-block-image"
              loading={heroAssetIds.has(id) ? "eager" : "lazy"}
              fetchPriority={heroAssetIds.has(id) ? "high" : undefined}
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
        related={(b) =>
          b.data.source === "team" ? (
            team?.length ? (
              <Team context={c} authors={team.slice(0, 3)} />
            ) : (
              <p className="public-empty">
                El equipo aún no tiene perfiles públicos.
              </p>
            )
          ) : (
            <EntryCards
              context={c}
              entries={
                b.data.source === "posts"
                  ? posts?.rows.slice(0, 3) || []
                  : b.data.source === "services"
                    ? services?.rows.slice(0, 3) || []
                    : liveRelated.filter(Boolean)
              }
            />
          )
        }
      />
      {doc.kind === "post" &&
        !doc.blocks.some((b) => b.type === "related_content") &&
        liveRelated.length > 0 && (
          <section className="public-related-footer">
            <h2 className="font-editorial">Sigue leyendo</h2>
            <EntryCards context={c} entries={liveRelated.filter(Boolean)} />
          </section>
        )}
    </article>
  );
}
