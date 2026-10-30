import "server-only";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { requestContext, canonicalUrl } from "./context";
import {
  publicEntry,
  publicRedirect,
  snapshotData,
  authorData,
  sectionAvailable,
  publicAssets,
} from "./data";
import { publicClient, result } from "./db";
import { sitePath, publicHref, siteName, publicPathValid } from "./paths";
import { PublicFrame } from "@/components/public/frame";
import { PublicDocumentView } from "@/components/public/document";
import { PublicListing } from "@/components/public/listing";
import { ContactSection } from "@/components/public/contact-section";
import { Team } from "@/components/public/team";
import { MediaImage } from "@/components/ui/media-image";
import type { PublicContext } from "./types";

type Search = Record<string, string | string[] | undefined>;
const pageData = cache(async (path: string) => {
  const c = await requestContext(path);
  if (!c) return null;
  return { c, entry: await publicEntry(c) };
});
export async function publicMetadata(path: string): Promise<Metadata> {
  const data = await pageData(path);
  if (!data)
    return {
      title: { absolute: "Sitio no disponible" },
      robots: { index: false, follow: false },
    };
  const { c, entry } = data;
  let title = entry?.title || c.route?.author?.display_name || c.route?.term?.name || virtualTitle(c);

  let description = entry?.excerpt || String(c.site.settings.description || "");
  if (entry && typeof entry.seo.title === "string" && entry.seo.title.trim())
    title = entry.seo.title;
  if (entry && typeof entry.seo.description === "string")
    description = entry.seo.description;
  const canonical = canonicalUrl(c);
  const translations =
    c.route?.translations || result(
      await publicClient()
        .from("published_content")
        .select("locale,path")
        .eq("site_id", c.site.id)
        .eq("path", c.path),
    ) || [];
  const languages = Object.fromEntries(
    translations.map((t) => [t.locale, canonicalUrl(c, t.path, t.locale)]),
  );

  const image = entry?.cover_asset_id
    ? result(
        await publicClient()
          .from("media_assets")
          .select("storage_path,width,height,alt_text")
          .eq("id", entry.cover_asset_id)
          .eq("site_id", c.site.id)
          .eq("bucket_id", "cms-public")
          .maybeSingle(),
      )
    : null;
  const src = image
    ? publicClient().storage.from("cms-public").getPublicUrl(image.storage_path)
        .data.publicUrl
    : null;
  // An optional CMS canonical stays inside this site and language, including the local prefix.
  let customCanonical = canonical;
  if (
    entry &&
    typeof entry.seo.canonical_url === "string" &&
    entry.seo.canonical_url.trim()
  ) {
    try {
      const raw = entry.seo.canonical_url;
      if (raw.startsWith("/") && publicPathValid(raw)) {
        const { reservedPath } = await import("./paths");
        if (!reservedPath.test(raw)) customCanonical = canonicalUrl(c, raw);
      } else {
        const candidate = new URL(raw);
        const resolved = await requestContext(candidate.pathname);
        if (
          candidate.origin === c.origin &&
          !candidate.search &&
          !candidate.hash &&
          resolved?.site.id === c.site.id &&
          resolved.locale === c.locale &&
          (await publicEntry(resolved))
        )
          customCanonical = candidate.href;
      }
    } catch {}
  }
  return {
    title: { absolute: `${title} · ${siteName(c.site)}` },
    description,
    metadataBase: new URL(c.origin),
    alternates: { canonical: customCanonical, languages },
    robots: { index: !c.local && entry?.seo.noindex !== true, follow: true },
    openGraph: {
      type: entry?.kind === "post" ? "article" : "website",
      siteName: siteName(c.site),
      title: entry?.seo.og_title ? String(entry.seo.og_title) : title,
      description: entry?.seo.og_description
        ? String(entry.seo.og_description)
        : description,
      url: customCanonical,
      locale: c.locale.replace("-", "_"),
      ...(src
        ? {
            images: [
              {
                url: src,
                width: image?.width || undefined,
                height: image?.height || undefined,
                alt: image?.alt_text || title,
              },
            ],
          }
        : { images: [] }),
      ...(entry?.kind === "post" && entry.first_published_at
        ? { publishedTime: entry.first_published_at }
        : {}),
    },
    twitter: {
      card: src ? "summary_large_image" : "summary",
      title,
      description,
      images: src ? [src] : [],
    },
  };
}
function virtualTitle(c: PublicContext) {
  if (c.path === sitePath(c.site, "blog_path", "/articulos"))
    return "Ideas y actualidad";
  if (c.path === sitePath(c.site, "team_path", "/equipo"))
    return "Personas que te acompañan";
  if (c.path === sitePath(c.site, "services_path", "/servicios"))
    return "Áreas de práctica";
  if (c.path === sitePath(c.site, "contact_path", "/contacto"))
    return "Conversemos";
  return siteName(c.site);
}
function crumb(c: PublicContext, label: string) {
  const parents = c.route?.ancestors || [];
  return (
    <nav className="public-breadcrumbs" aria-label="Ruta de navegación">
      <Link href={publicHref(c, "/")}>Inicio</Link>
      {parents.map((p) => (
        <span key={p.id}>
          <span aria-hidden>/ </span>
          <Link href={publicHref(c, p.path)}>{p.title}</Link>
        </span>
      ))}
      <span aria-hidden>/</span>
      <span aria-current="page">{label}</span>
    </nav>
  );
}
export async function publicPage(path: string, search: Search = {}) {
  const data = await pageData(path);
  if (!data) notFound();
  const { c, entry } = data;
  const redirectRule = !entry ? await publicRedirect(c) : null;
  if (redirectRule) permanentRedirect(publicHref(c, redirectRule.path));
  // 301 vs 308 are preserved by Proxy before streaming (see lib/public/redirects.ts).
  if (!entry && !(await sectionAvailable(c))) notFound();
  let body: React.ReactNode;
  let title = entry?.title || c.route?.author?.display_name || c.route?.term?.name || virtualTitle(c);

  if (entry) {
    const snapshot = await snapshotData(c.site.id, entry.id, entry.revision_id);
    if (!snapshot) notFound();
    const extras =
      entry.template_version === 1 && entry.template_key === "blog-index" ? (
        <PublicListing context={c} search={search} />
      ) : entry.template_version === 1 &&
        entry.template_key === "services-index" ? (
        <PublicListing context={c} kind="landing" search={search} />
      ) : entry.template_version === 1 && entry.template_key === "team" ? (
        <Team context={c} authors={await authorData(c)} />
      ) : null;
    const contact =
      (entry.template_version === 1 || (entry.template_key === "service-landing" && entry.template_version === 2)) &&
      (entry.template_key === "contact" ||
        (entry.template_key === "service-landing" &&
          c.site.settings.contact_on_landings === true));
    body = (
      <>
        {c.path !== "/" && crumb(c, entry.title)}
        <PublicDocumentView data={snapshot} context={c} beforeFaq={contact && entry.template_key === "contact" ? <ContactSection context={c} entryId={entry.id} /> : undefined} />
        {extras}
        {contact && entry.template_key !== "contact" && (
          <ContactSection
            context={c}
            entryId={entry.id}
            subject={entry.kind === "landing" ? entry.title : ""}
          />
        )}
      </>
    );
  } else if (c.path === sitePath(c.site, "blog_path", "/articulos"))
    body = (
      <>
        <PublicHeading title={title} eyebrow="Publicaciones del estudio" />
        <PublicListing context={c} search={search} />
      </>
    );
  else if (c.path === sitePath(c.site, "services_path", "/servicios"))
    body = (
      <>
        <PublicHeading title={title} eyebrow="Cómo podemos ayudarte" />
        <PublicListing context={c} kind="landing" search={search} />
      </>
    );
  else if (c.path === sitePath(c.site, "team_path", "/equipo")) {
    const authors = await authorData(c);
    body = (
      <>
        <PublicHeading title={title} eyebrow="Nuestro equipo" />
        {authors.length ? (
          <Team context={c} authors={authors} />
        ) : (
          <p className="public-empty">
            El estudio todavía no ha publicado perfiles de su equipo.
          </p>
        )}
      </>
    );
  } else if (
    c.path === sitePath(c.site, "contact_path", "/contacto") &&
    c.site.settings.contact_enabled === true
  )
    body = (
      <>
        <PublicHeading title={title} eyebrow="Estamos para escucharte" />
        <ContactSection context={c} />
      </>
    );
  else if (c.path.startsWith("/autores/") && c.path.split("/").length === 3) {
    const author = c.route?.author;
    if (!author) notFound();
    title = author.display_name;
    const portrait = author.avatar_asset_id
      ? (await publicAssets(c.site.id, [author.avatar_asset_id]))[0]
      : null;
    body = (
      <>
        {crumb(c, "Equipo")}
        <section className="public-author-profile">
          <p className="public-eyebrow">
            {author.professional_title || "Equipo del estudio"}
          </p>
          <h1 className="font-editorial">{author.display_name}</h1>
          <p className="public-lead">{author.biography}</p>
          {portrait && portrait.mime_type.startsWith("image/") && (
            <div className="public-profile-portrait">
              <MediaImage
                src={portrait.src}
                alt={portrait.alt_text || author.display_name}
                width={portrait.width || 800}
                height={portrait.height || 1000}
              />
            </div>
          )}
        </section>
        <h2 className="public-subheading font-editorial">
          Publicaciones de {author.display_name}
        </h2>
        <PublicListing context={c} authorId={author.id} search={search} />
      </>
    );
  } else if (
    c.path.startsWith("/taxonomias/") &&
    c.path.split("/").length === 4
  ) {
    const tx = c.route?.taxonomy;
    const term = c.route?.term;
    if (!tx || !term) notFound();
    title = term.name;
    body = (
      <>
        <PublicHeading title={title} eyebrow={tx.name} />
        <PublicListing context={c} termId={term.id} search={search} />
      </>
    );
  } else notFound();
  const jsonLd: Record<string, unknown>[] = [];
  const email = String(c.site.settings.email || "");
  if (
    c.site.settings.public_name &&
    c.site.settings.address &&
    c.site.settings.email
  )
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: siteName(c.site),
      url: canonicalUrl(c, "/"),
      email,
      address: String(c.site.settings.address),
      ...(c.site.settings.phone
        ? { telephone: String(c.site.settings.phone) }
        : {}),
    });
  if (entry?.kind === "post")
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: entry.title,
      description: entry.excerpt,
      datePublished: entry.first_published_at,
      mainEntityOfPage: canonicalUrl(c),
    });
  return (
    <PublicFrame context={c}>
      <div className="public-container">{body}</div>
      {jsonLd.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </PublicFrame>
  );
}
function PublicHeading({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <header className="public-document-heading">
      <p className="public-eyebrow">{eyebrow}</p>
      <h1 className="font-editorial">{title}</h1>
    </header>
  );
}
