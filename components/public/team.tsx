import Link from "next/link";
import { UserRound, ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { publicAssets } from "@/lib/public/data";
import { publicHref } from "@/lib/public/paths";
import type { PublicContext, PublicAuthor } from "@/lib/public/types";
export async function Team({
  authors,
  context: c,
}: {
  authors: PublicAuthor[];
  context: PublicContext;
}) {
  const assets = await publicAssets(
    c.site.id,
    authors.map((a) => a.avatar_asset_id).filter(Boolean) as string[],
  );
  return (
    <div className="public-team-grid">
      {authors.map((a) => {
        const asset = assets.find((m) => m.id === a.avatar_asset_id);
        return (
          <article key={a.id} className="public-team-card">
            {asset && asset.mime_type.startsWith("image/") ? (
              <MediaImage
                src={asset.src}
                alt={asset.alt_text || a.display_name}
                width={asset.width || 800}
                height={asset.height || 1000}
              />
            ) : (
              <div className="team-empty-portrait">
                <UserRound size={44} strokeWidth={1} aria-hidden />
              </div>
            )}
            <h3 className="font-editorial">
              <Link
                href={publicHref(c, `/autores/${encodeURIComponent(a.slug)}`)}
              >
                {a.display_name}
                <ArrowUpRight size={18} aria-hidden />
              </Link>
            </h3>
            {a.professional_title && (
              <p className="team-role">{a.professional_title}</p>
            )}
            {a.biography && <p>{a.biography}</p>}
          </article>
        );
      })}
    </div>
  );
}
