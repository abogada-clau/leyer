import { type ReactNode } from "react";
import { ArrowUpRight, ArrowRight, Building2, Check, Compass, HeartHandshake, MessageCircle, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/components/patterns/content";
import { Alert } from "@/components/ui/alert";
import { RichText } from "./rich-text";
import { ServiceVisual, ServiceRichText } from "./service-layout";
import { ContentIcon } from "./content-icon";
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
function decisionCategory(href: string) {
  const path = href.split(/[?#]/)[0];
  if (path.includes("/empresas/")) return { label: "Mi empresa", Icon: Building2, tone: "sand" };
  if (path.endsWith("/divorcios")) return { label: "Separación y divorcio", Icon: HeartHandshake, tone: "sage" };
  if (path.endsWith("/pension-de-alimentos")) return { label: "Pensión de alimentos", Icon: Users, tone: "sage" };
  if (path.endsWith("/insolvencia-y-reemprendimiento")) return { label: "Deudas personales", Icon: WalletCards, tone: "sand" };
  return { label: "Orientación legal", Icon: Compass, tone: "sage" };
}
export function ContentBlocks({
  blocks,
  link,
  image,
  related,
  firstHeroAsTitle = false,
  preview = false,
  contactHref,
  homeNavigation = false,
  overviewLinks = [],
  serviceLayout = false,
}: {
  blocks: Block[];
  link: (href: unknown) => string | null;
  image: (id: string, alt: string, focal?: Json) => ReactNode;
  related?: (block: Block) => ReactNode;
  firstHeroAsTitle?: boolean;
  preview?: boolean;
  contactHref?: string;
  homeNavigation?: boolean;
  overviewLinks?: { href: string; label: string }[];
  serviceLayout?: boolean;
}) {
  const displayBlocks = blocks.filter(block => block.data.hidden !== true);
  const introIndex = displayBlocks.findIndex(block => ["split_content", "rich_text"].includes(block.type) && block.schema_version === 1);
  const firstNavigation = displayBlocks.findIndex(block => block.type === "card_grid" && Array.isArray(block.data.items) && block.data.items.some(item => link(record(item).href)));
  return (
    <div className="content-blocks">
      {displayBlocks.map((b, index) => {
        if (!supportedBlocks.has(b.type) || b.schema_version !== 1)
          return preview ? (
            <Alert key={b.key} variant="warning" title="Bloque incompatible">
              {b.type} · versión {b.schema_version}. Esta sección no se mostrará
              públicamente.
            </Alert>
          ) : null;
        const d = b.data;
        const items = Array.isArray(d.items) ? d.items.map(record) : [];
        const decisions = homeNavigation && index === firstNavigation && items.length > 0 && items.every(item => link(item.href));
        const title = str(d.heading);
        const benefits = serviceLayout && b.type === "card_grid" && b.variant === "benefits";
        const H =
          index === 0 && b.type === "hero" && firstHeroAsTitle ? "h1" : "h2";
        const assets = b.assets.filter(a => !a.slot.startsWith("item-")).map((a) => (
          <figure key={a.slot}>
            {image(a.asset_id, a.alt_text, a.focal_point)}
            {d.caption && <figcaption>{str(d.caption)}</figcaption>}
          </figure>
        ));
        const visual = d.visual === "none" ? null : d.visual === "brand" || d.visual === "requirements" ? <ServiceVisual variant={d.visual} /> : assets.length ? assets : null;
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
                  variant={a.style === "text" ? "ghost" : a.style === "secondary" ? "outline" : a.style === "primary" ? "default" : i ? "ghost" : "default"}
                >
                  <a href={href} data-action-style={str(a.style) || (i ? "text" : "primary")}>
                    {a.icon && a.icon !== "none" && <ContentIcon name={a.icon} />}
                    {str(a.label)}
                    {!serviceLayout && !a.icon && <ArrowUpRight aria-hidden />}
                  </a>
                </Button>
              ) : null;
            })}
          </div>
        ) : null;
        const heading = (
          <header className="block-heading">
            {d.eyebrow && <p className="public-eyebrow">{str(d.eyebrow)}</p>}
            {title && <H className="font-editorial">{title}</H>}
            {d.lead && <p className="service-hero-lead">{str(d.lead)}</p>}
            {d.body && <p className="public-block-body">{str(d.body)}</p>}
          </header>
        );
        let content: ReactNode;
        if (b.type === "hero" || b.type === "split_content")
          content = (
            <>
              <div className="block-copy">
                {heading}
                {actions}
                {d.note && <p className="public-action-note"><ContentIcon name={d.note_icon} size={15} />{str(d.note)}</p>}
                {!serviceLayout && b.type === "hero" && contactHref && !d.note && <p className="public-action-note"><MessageCircle size={15} aria-hidden /> El primer paso es contarnos qué necesitas resolver.</p>}
              </div>
              {(serviceLayout ? visual : assets.length > 0) && <div className="block-visual">{serviceLayout ? visual : assets}</div>}
            </>
          );
        else if (b.type === "card_grid")
          content = (
            <>
              {decisions ? (
                <div className="public-decision-heading">
                  <div>{heading}<p className="public-decision-hint">Elige la situación que más se acerca a la tuya y conoce tus alternativas.</p></div>
                  {overviewLinks.length > 0 && <nav aria-label="Explorar todas las áreas" className="public-decision-overview">
                    {overviewLinks.map(item => <a key={item.href} href={item.href}>{item.label}<ArrowUpRight size={16} aria-hidden /></a>)}
                  </nav>}
                </div>
              ) : heading}
              <div className={benefits ? "service-benefit-grid" : "public-service-grid"} data-columns={str(d.columns) || undefined}>
                {items.map((item, i) => {
                  const href = link(item.href);
                  const category = decisions && href ? decisionCategory(href) : null;
                  const Icon = category?.Icon;
                  const inner = (
                    <>
                      {category && Icon && <span className="decision-category"><span className="decision-icon"><Icon size={23} strokeWidth={1.6} aria-hidden /></span>{category.label}</span>}
                      {item.asset_slot && b.assets.filter(asset => asset.slot === item.asset_slot).map(asset => <figure className="service-item-image" key={asset.slot}>{image(asset.asset_id, asset.alt_text, asset.focal_point)}</figure>)}
                      {serviceLayout ? (item.icon && item.icon !== "none" && <span className="service-marker" aria-hidden><ContentIcon name={item.icon} size={30} /></span>) : !href && <span className="service-marker" aria-hidden><Check size={17} strokeWidth={1.5} /></span>}
                      <h3 className="font-editorial">{str(item.heading)}</h3>
                      <p>{str(item.body)}</p>
                      {href && (
                        <span className="service-more">
                          {str(item.link_label) || (!serviceLayout ? "Conocer el servicio" : "")}
                          {decisions ? <ArrowRight aria-hidden size={18} /> : <ArrowUpRight aria-hidden size={17} />}
                        </span>
                      )}
                    </>
                  );
                  return href ? (
                    <a href={href} key={i} className={benefits ? "service-benefit" : "public-service-item"} data-tone={category?.tone}>
                      {inner}
                    </a>
                  ) : (
                    <div key={i} className={benefits ? "service-benefit" : "public-service-item"}>
                      {inner}
                    </div>
                  );
                })}
              </div>
              {contactHref && !serviceLayout && index === firstNavigation && (
                <aside className="public-service-guidance">
                  <div><p>¿No sabes qué opción corresponde a tu situación?</p><span>Cuéntanos qué ocurre y conversemos sobre el siguiente paso.</span></div>
                  <a href={contactHref}>Hablemos de tu caso <ArrowUpRight size={18} aria-hidden /></a>
                </aside>
              )}
            </>
          );
        else if (b.type === "checklist")
          content = (
            <>
              {serviceLayout ? (
                <>
                  {visual && <div className="block-visual">{visual}</div>}
                  <div className="block-copy">
                    {heading}
                    <ol className="public-checklist service-requirements">
                      {items.map((item, i) => <li key={i}><span className="service-requirement-number" aria-hidden>{i + 1}</span><span>{str(item.text)}</span></li>)}
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  {heading}
                  <ul className="public-checklist">
                    {items.map((item, i) => <li key={i}><Check aria-hidden size={18} /><span>{str(item.text)}</span></li>)}
                  </ul>
                </>
              )}
            </>
          );
        else if (b.type === "steps")
          content = (
            <>
              {heading}
              <ol className="public-steps" data-columns={str(d.columns) || undefined}>
                {items.map((item, i) => (
                  <li key={i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{str(item.heading)}</h3>
                      <p>{str(item.body)}</p>
                    </div>
                    {serviceLayout && i < items.length - 1 && <ArrowRight className="service-step-arrow" size={18} strokeWidth={1.3} aria-hidden />}
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
              {serviceLayout && visual && <div className="block-visual">{visual}</div>}
              <div className="service-cta-actions">
                {actions}
              </div>
            </>
          );
        else if (b.type === "rich_text")
          content = serviceLayout ? <><ServiceRichText document={d.document} link={link} layout={d.layout} visual={visual} />{d.layout !== "intro" && visual && <div className="service-rich-media block-visual">{visual}</div>}</> : <RichText document={d.document} link={link} />;
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
          <section key={b.key}
            data-block={b.type}
            aria-label={str(d.aria_label) || undefined}
            data-tone={str(d.tone) || undefined}
            data-service-intro={serviceLayout && index === introIndex ? "true" : undefined}
            data-layout={b.type === "card_grid" ? (benefits ? "benefits" : decisions ? "decisions" : items.some(item => link(item.href)) ? "navigation" : "features") : undefined}
            className={`public-block block-${b.type} variant-${["default", "image-right", "image-left", "centered", "benefits"].includes(b.variant) ? b.variant : "default"} ${(serviceLayout ? visual : assets.length) ? "has-media" : ""} ${benefits ? "service-benefits" : ""}`}
          >
            {content}
          </section>
        );
      })}
    </div>
  );
}
