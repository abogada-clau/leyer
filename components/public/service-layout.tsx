import type { ReactNode } from "react";
import { Check, FileCheck2, Scale } from "lucide-react";
import { LegalIllustration } from "@/components/design-system/brand";
import { RichText } from "./rich-text";
import type { Json } from "@/lib/admin/types";

/** Brand illustrations are the fallback when an editor has not supplied media. */
export function ServiceVisual({ variant }: { variant: "brand" | "requirements" }) {
  if (variant === "brand") return <div className="service-brand-visual" aria-hidden><LegalIllustration /></div>;
  return (
    <div className="service-requirements-visual" aria-hidden>
      <div className="service-paper service-paper-back" />
      <div className="service-paper">
        <Scale size={44} strokeWidth={1.2} />
        <div className="service-paper-rule" />
        {[0, 1, 2].map(i => <div className="service-paper-line" key={i}><Check size={15} /><span /></div>)}
        <FileCheck2 className="service-paper-seal" size={40} strokeWidth={1.2} />
      </div>
    </div>
  );
}

/** Lay out existing rich text without flattening links, emphasis, lists or copy. */
export function ServiceRichText({ document, link, layout, visual }: { document: Json; link: (href: unknown) => string | null; layout?: Json; visual?: ReactNode }) {
  if (layout === "intro") return (
    <div className={`service-rich-intro${visual ? " has-media" : ""}`}>
      <div className="block-copy"><RichText document={document} link={link} /></div>
      {visual && <div className="block-visual">{visual}</div>}
    </div>
  );
  if (layout !== "columns") return <RichText document={document} link={link} />;
  const nodes = document && typeof document === "object" && !Array.isArray(document) && Array.isArray(document.content) ? document.content : [];
  const isSubheading = (node: Json) => node && typeof node === "object" && !Array.isArray(node) && node.type === "heading" && node.attrs && typeof node.attrs === "object" && !Array.isArray(node.attrs) && node.attrs.level === 3;
  const first = nodes.findIndex(isSubheading);
  if (first < 0) return <RichText document={document} link={link} />;
  const groups: Json[][] = [];
  for (const node of nodes.slice(first)) {
    if (isSubheading(node)) groups.push([]);
    groups[groups.length - 1].push(node);
  }
  return (
    <div className="service-rich-sections">
      {first > 0 && <RichText document={{ type: "doc", content: nodes.slice(0, first) }} link={link} />}
      <div className="service-rich-grid">
        {groups.map((content, index) => <div className="service-rich-item" key={index}><RichText document={{ type: "doc", content }} link={link} /></div>)}
      </div>
    </div>
  );
}
