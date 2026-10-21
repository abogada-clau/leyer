import Link from "next/link";
import { AssetPreview } from "./asset-preview";
import { ContentBlocks } from "@/components/public/content-blocks";
import { Alert } from "@/components/ui/alert";
import type { Asset, Snapshot, Entry, Row } from "@/lib/admin/types";
import type { PublicEntry } from "@/lib/public/types";
import { safeHref } from "@/lib/admin/validation";
export function ContentPreview({
  snapshot,
  assets,
  entries,
  authors,
  publishedEntries = [],
}: {
  snapshot: Snapshot;
  assets: Asset[];
  entries: Entry[];
  authors: Row[];
  publishedEntries?: PublicEntry[];
}) {
  const asset = (id: string | null) => assets.find((a) => a.id === id);
  const cover = asset(snapshot.cover_asset_id);
  const templateKnown =
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
    ].includes(snapshot.template_key) && snapshot.template_version === 1;
  const heroTitle =
    templateKnown &&
    ["home", "service-landing"].includes(snapshot.template_key) &&
    snapshot.blocks[0]?.type === "hero" &&
    snapshot.blocks[0].schema_version === 1;
  return (
    <div className="public-site">
      <article
        className={`public-document template-${templateKnown ? snapshot.template_key : "default"}`}
      >
        {!templateKnown && (
          <Alert variant="warning" title="Se usará la plantilla predeterminada">
            La clave o versión configurada no tiene una composición específica.
          </Alert>
        )}
        {!heroTitle && (
          <header className="public-document-heading">
            <h1 className="font-editorial">{snapshot.title}</h1>
            {snapshot.excerpt && (
              <p className="public-lead">{snapshot.excerpt}</p>
            )}
            {snapshot.authors.length > 0 && (
              <p className="public-byline">
                Por{" "}
                {snapshot.authors
                  .map((id) =>
                    String(
                      authors.find((a) => a.id === id)?.display_name || "",
                    ),
                  )
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {cover && <AssetPreview asset={cover} />}
          </header>
        )}
        <ContentBlocks
          blocks={snapshot.blocks}
          firstHeroAsTitle={heroTitle}
          preview
          link={(href) => (safeHref(href) ? String(href) : null)}
          image={(id, alt) => {
            const a = asset(id);
            return a ? (
              <AssetPreview asset={{ ...a, alt_text: alt || a.alt_text }} />
            ) : null;
          }}
          related={(b) => {
            if (b.data.source === "team")
              return (
                <div className="public-team-grid">
                  {authors
                    .filter((a) => a.is_public === true)
                    .map((a) => (
                      <article className="public-team-card" key={a.id}>
                        {a.avatar_asset_id &&
                          asset(String(a.avatar_asset_id)) && (
                            <AssetPreview
                              asset={asset(String(a.avatar_asset_id))!}
                            />
                          )}
                        <h3 className="font-editorial">
                          {String(a.display_name)}
                        </h3>
                        <p className="team-role">
                          {String(a.professional_title || "")}
                        </p>
                        <p>{String(a.biography || "")}</p>
                      </article>
                    ))}
                </div>
              );
            const rows =
              b.data.source === "posts"
                ? publishedEntries.filter((e) => e.kind === "post").slice(0, 3)
                : b.data.source === "services"
                  ? publishedEntries
                      .filter((e) => e.kind === "landing")
                      .slice(0, 3)
                  : entries.filter((e) =>
                      snapshot.relations.some((r) => r.entry_id === e.id),
                    );
            return rows.length ? (
              <div className="public-entry-grid">
                {rows.map((e) => (
                  <article className="public-entry-card" key={e.id}>
                    <div>
                      <h3 className="font-editorial">
                        <Link href={`/admin/content/${e.id}/preview`}>
                          {e.title ||
                            ("internal_name" in e
                              ? e.internal_name
                              : "Contenido")}
                        </Link>
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="public-empty">
                Todavía no hay contenidos publicados para esta sección.
              </p>
            );
          }}
        />
        {["contact", "service-landing"].includes(snapshot.template_key) && (
          <Alert title="Formulario de consulta">
            Se muestra públicamente cuando está habilitado en el sitio y hay una
            política de privacidad publicada.
          </Alert>
        )}
      </article>
    </div>
  );
}
