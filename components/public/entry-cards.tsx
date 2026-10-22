import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { publicAssets } from "@/lib/public/data";
import { publicHref } from "@/lib/public/paths";
import type { PublicContext, PublicEntry } from "@/lib/public/types";
export async function EntryCards({
  entries,
  context: c,
}: {
  entries: PublicEntry[];
  context: PublicContext;
}) {
  const assets = await publicAssets(
    c.site.id,
    entries.map((e) => e.cover_asset_id).filter(Boolean) as string[],
  );
  return (
    <div className="public-entry-grid" data-count={entries.length}>
      {entries.map((e) => {
        const a = assets.find((a) => a.id === e.cover_asset_id);
        return (
          <article
            key={e.id}
            className={`public-entry-card ${a ? "has-cover" : ""}`}
          >
            {a && a.mime_type.startsWith("image/") && (
              <Link href={publicHref(c, e.path)} tabIndex={-1} aria-hidden>
                <MediaImage
                  src={a.src}
                  alt={a.alt_text}
                  width={a.width || 1200}
                  height={a.height || 800}
                />
              </Link>
            )}
            <div>
              <p className="public-eyebrow">
                {e.kind === "post"
                  ? "Lecturas"
                  : e.kind === "landing"
                    ? "Área de práctica"
                    : "El estudio"}
              </p>
              <h3 className="font-editorial">
                <Link href={publicHref(c, e.path)}>
                  {e.title}
                  <ArrowUpRight aria-hidden size={18} />
                </Link>
              </h3>
              {e.excerpt && <p>{e.excerpt}</p>}
              {e.kind === "post" && e.first_published_at && (
                <time dateTime={e.first_published_at}>
                  {new Intl.DateTimeFormat(c.locale, {
                    dateStyle: "long",
                    timeZone: "America/Santiago",
                  }).format(new Date(e.first_published_at))}
                </time>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
