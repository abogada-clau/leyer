import type { ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/components/patterns/content";
import { Alert } from "@/components/ui/alert";
import { RichText } from "./rich-text";
import type { Block, Json } from "@/lib/admin/types";
export const supportedBlocks = new Set([
  "hero",
  "split_content",
  "card_grid",
  "checklist",
  "steps",
  "faq",
  "cta",
  "rich_text",
  "image",
  "quote",
  "related_content",
]);
function record(v: Json): Record<string, Json> {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}
function str(v: Json | undefined) {
  return typeof v === "string" ? v : "";
}
export function ContentBlocks({
  blocks,
  link,
  image,
  related,
  firstHeroAsTitle = false,
  preview = false,
}: {
  blocks: Block[];
  link: (href: unknown) => string | null;
  image: (id: string, alt: string, focal?: Json) => ReactNode;
  related?: (block: Block) => ReactNode;
  firstHeroAsTitle?: boolean;
  preview?: boolean;
}) {
  return (
    <div className="content-blocks">
      {blocks.map((b, index) => {
        if (!supportedBlocks.has(b.type) || b.schema_version !== 1)
          return preview ? (
            <Alert key={b.key} variant="warning" title="Bloque incompatible">
              {b.type} · versión {b.schema_version}. Esta sección no se mostrará
              públicamente.
            </Alert>
          ) : null;
        const d = b.data;
        const items = Array.isArray(d.items) ? d.items.map(record) : [];
        const title = str(d.heading);
        const H =
          index === 0 && b.type === "hero" && firstHeroAsTitle ? "h1" : "h2";
        const assets = b.assets.map((a) => (
          <figure key={a.slot}>
            {image(a.asset_id, a.alt_text, a.focal_point)}
            {d.caption && <figcaption>{str(d.caption)}</figcaption>}
          </figure>
        ));
        const actions = Array.isArray(d.actions) ? (
          <div className="public-actions">
            {d.actions.map((v, i) => {
              const a = record(v);
              const href = link(a.href);
              return href ? (
                <Button
                  key={i}
                  asChild
                  size="lg"
                  variant={i ? "outline" : "default"}
                >
                  <a href={href}>
                    {str(a.label)}
                    <ArrowUpRight aria-hidden />
                  </a>
                </Button>
              ) : null;
            })}
          </div>
        ) : null;
        const heading = (
          <>
            {d.eyebrow && <p className="public-eyebrow">{str(d.eyebrow)}</p>}
            {title && <H className="font-editorial">{title}</H>}
            {d.body && <p className="public-block-body">{str(d.body)}</p>}
          </>
        );
        let content: ReactNode;
        if (b.type === "hero" || b.type === "split_content")
          content = (
            <>
              <div className="block-copy">
                {heading}
                {actions}
              </div>
              {assets.length > 0 && (
                <div className="block-visual">{assets}</div>
              )}
            </>
          );
        else if (b.type === "card_grid")
          content = (
            <>
              {heading}
              <div className="public-service-grid">
                {items.map((item, i) => {
                  const href = link(item.href);
                  const inner = (
                    <>
                      <span className="service-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-editorial">{str(item.heading)}</h3>
                      <p>{str(item.body)}</p>
                      {href && (
                        <span className="service-more">
                          {str(item.link_label) || "Conocer el servicio"}
                          <ArrowUpRight aria-hidden size={17} />
                        </span>
                      )}
                    </>
                  );
                  return href ? (
                    <a href={href} key={i} className="public-service-item">
                      {inner}
                    </a>
                  ) : (
                    <div key={i} className="public-service-item">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </>
          );
        else if (b.type === "checklist")
          content = (
            <>
              {heading}
              <ul className="public-checklist">
                {items.map((item, i) => (
                  <li key={i}>
                    <Check aria-hidden size={18} />
                    <span>{str(item.text)}</span>
                  </li>
                ))}
              </ul>
            </>
          );
        else if (b.type === "steps")
          content = (
            <>
              {heading}
              <ol className="public-steps">
                {items.map((item, i) => (
                  <li key={i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{str(item.heading)}</h3>
                      <p>{str(item.body)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          );
        else if (b.type === "faq")
          content = (
            <>
              {heading}
              <FAQ
                items={items.map((i) => ({
                  question: str(i.question),
                  answer: str(i.answer),
                }))}
              />
            </>
          );
        else if (b.type === "cta")
          content = (
            <>
              <div className="block-copy">{heading}</div>
              {actions}
            </>
          );
        else if (b.type === "rich_text")
          content = <RichText document={d.document} link={link} />;
        else if (b.type === "image") content = <>{assets}</>;
        else if (b.type === "quote")
          content = (
            <blockquote>
              <p className="font-editorial">{str(d.text)}</p>
              {d.attribution && <footer>{str(d.attribution)}</footer>}
            </blockquote>
          );
        else
          content = (
            <>
              {heading}
              {related?.(b)}
            </>
          );
        return (
          <section
            key={b.key}
            data-block={b.type}
            className={`public-block block-${b.type} variant-${["default", "image-right", "image-left", "centered"].includes(b.variant) ? b.variant : "default"} ${assets.length ? "has-media" : ""}`}
          >
            {content}
          </section>
        );
      })}
    </div>
  );
}
