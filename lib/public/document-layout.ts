import type { PublicDocument } from "./types";

export function documentLayout(document: PublicDocument) {
  const { template_key: template, template_version: version } = document;
  const knownTemplate = (version === 1 && [
    "default", "home", "service-landing", "article", "contact", "team", "blog-index", "services-index", "legal",
  ].includes(template)) || (template === "service-landing" && version === 2);
  const serviceLayout = knownTemplate && template === "service-landing";
  const first = document.blocks.find(block => block.data.hidden !== true);
  const hero = knownTemplate && ["home", "service-landing", "default"].includes(template) &&
    first?.type === "hero" && first.schema_version === 1 ? first : null;
  return { knownTemplate, serviceLayout, hero };
}
