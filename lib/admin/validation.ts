import { validatePresentation } from "@/lib/content/presentation-validation";
import type { Snapshot, Json } from "./types";
export function text(
  value: unknown,
  label: string,
  max = 200,
  required = true,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    throw new Error(
      `${label}: escribe un valor válido de hasta ${max} caracteres.`,
    );
  return value.trim();
}
export function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new Error("Identificador inválido.");
  return value;
}
export function path(value: unknown) {
  const result = text(value, "Ruta", 2000);
  if (
    !result.startsWith("/") ||
    /[?#%\s\\]|\/\/|(^|\/)\.\.?($|\/)/.test(result) ||
    (result !== "/" && result.endsWith("/"))
  )
    throw new Error(
      "Usa una ruta como /servicios/familia, sin espacios ni barra final.",
    );
  return result;
}
export function safeHref(value: unknown) {
  return (
    typeof value === "string" &&
    !/[\s\\]/.test(value) &&
    (/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(value) ||
      /^\/(?!\/)/.test(value) ||
      /^https:\/\/[^/]+/.test(value) ||
      /^(mailto:|tel:)[^:]/.test(value))
  );
}
export function validateSnapshot(s: Snapshot) {
  text(s.title, "Título", 300);
  path(s.path);
  text(s.template_key, "Plantilla", 100);
  if (!Number.isInteger(s.template_version) || s.template_version < 1)
    throw new Error("La versión de plantilla debe ser un entero positivo.");
  if (!s.seo || typeof s.seo !== "object" || Array.isArray(s.seo))
    throw new Error("Metadatos SEO inválidos.");
  if (!Array.isArray(s.blocks) || s.blocks.length > 200)
    throw new Error("La composición admite hasta 200 bloques.");
  const required: Record<string, string[]> = {
    hero: ["heading"],
    split_content: ["heading", "body"],
    cta: ["heading", "actions"],
    quote: ["text"],
    rich_text: ["document"],
    card_grid: ["items"],
    checklist: ["items"],
    steps: ["items"],
    faq: ["items"],
    image: [],
    related_content: [],
  };
  for (const b of s.blocks) {
    uuid(b.key);
    validatePresentation(b);
    if (!(b.type in required) || b.schema_version !== 1 || !b.data)
      throw new Error("Tipo o versión de bloque inválidos.");
    for (const key of required[b.type])
      if (b.data[key] == null)
        throw new Error(`Falta ${key} en el bloque ${b.type}.`);
    for (const key of ["heading", "body", "text", "caption"])
      if (key in b.data && typeof b.data[key] !== "string")
        throw new Error(`${key} debe ser texto.`);
    if (["card_grid", "checklist", "steps", "faq"].includes(b.type)) {
      if (!Array.isArray(b.data.items) || !b.data.items.length)
        throw new Error("Agrega al menos un elemento al bloque.");
      const fields =
        b.type === "faq"
          ? ["question", "answer"]
          : b.type === "checklist"
            ? ["text"]
            : ["heading", "body"];
      for (const item of b.data.items)
        if (
          !item ||
          typeof item !== "object" ||
          Array.isArray(item) ||
          fields.some((f) => typeof item[f] !== "string")
        )
          throw new Error("Completa los campos de cada elemento del bloque.");
    }
    if (
      "actions" in b.data &&
      (!Array.isArray(b.data.actions) ||
        b.data.actions.some(
          (a) =>
            !a ||
            typeof a !== "object" ||
            Array.isArray(a) ||
            typeof a.label !== "string" ||
            !safeHref(a.href),
        ))
    )
      throw new Error(
        "Los botones requieren texto y un enlace seguro: ruta, HTTPS, mailto o tel.",
      );
    if (b.type === "rich_text") {
      const doc = b.data.document as Record<string, Json>;
      if (!doc || doc.type !== "doc" || !Array.isArray(doc.content))
        throw new Error("Documento enriquecido inválido.");
    }
    const slots = new Set<string>();
    for (const a of b.assets) {
      uuid(a.asset_id);
      if (slots.has(a.slot))
        throw new Error(
          "Cada recurso del bloque debe tener un espacio diferente.",
        );
      slots.add(a.slot);
    }
  }
  for (const id of [
    ...s.authors,
    ...s.terms,
    ...s.relations.map((r) => r.entry_id),
    ...(s.cover_asset_id ? [s.cover_asset_id] : []),
  ])
    uuid(id);
}
