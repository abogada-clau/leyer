import type { Block, Snapshot } from "../admin/types.ts";

// Initial editorial content only: copied into a revision by setup/migration, never rendered as a fallback.
export function serviceStarterBlocks(makeKey = () => crypto.randomUUID()): Block[] {
  return [{
    key: makeKey(), type: "card_grid", schema_version: 1, variant: "benefits", assets: [],
    data: { aria_label: "Nuestro acompañamiento", tone: "sage", columns: "4", items: [
      { icon: "heart-handshake", heading: "Tu situación primero", body: "Escuchamos tu contexto y lo que necesitas resolver." },
      { icon: "message-circle", heading: "Alternativas claras", body: "Te explicamos las opciones y las preguntas pendientes." },
      { icon: "book-open-check", heading: "Una estrategia fundada", body: "Revisamos los hechos y antecedentes de tu caso." },
      { icon: "wallet-cards", heading: "Un alcance acordado", body: "Definimos las gestiones y los honorarios antes de avanzar." },
    ] },
  }];
}

export function materializeServiceContent(snapshot: Snapshot, options: {
  heroAsset?: Block["assets"][number]; contactPath?: string; whatsappHref?: string;
  makeKey?: () => string;
} = {}): Snapshot {
  if (snapshot.template_key !== "service-landing" || snapshot.template_version >= 2) return structuredClone(snapshot);
  const result = structuredClone(snapshot);
  const makeKey = options.makeKey || (() => crypto.randomUUID());
  let firstIntro = true;
  result.blocks = result.blocks.map(block => {
    block.assets ||= [];
    if (block.schema_version !== 1) return block;
    const d = block.data;
    if (block.type === "hero") {
      if (d.heading !== result.title && d.lead === undefined) d.lead = d.heading;
      d.heading = result.title;
      if (d.eyebrow === result.title) d.eyebrow = "Asesoría y representación";
      if (d.note === undefined) d.note = "El primer paso es contarnos qué necesitas resolver.";
      if (d.note_icon === undefined) d.note_icon = "message-circle";
      if (!block.assets.length && options.heroAsset) block.assets = [options.heroAsset];
      if (d.visual === undefined) d.visual = block.assets.length ? "image" : "brand";
    }
    if (["split_content", "rich_text"].includes(block.type)) {
      if (block.type === "rich_text" && d.layout === undefined) d.layout = firstIntro ? "intro" : "columns";
      if (d.visual === undefined) d.visual = block.assets.length ? "image" : firstIntro || block.type === "split_content" ? "brand" : "none";
      if (firstIntro && block.type === "split_content" && block.variant === "default") block.variant = "image-right";
      firstIntro = false;
    }
    if (block.type === "checklist" && d.visual === undefined) d.visual = block.assets.length ? "image" : "requirements";
    if (block.type === "card_grid" && Array.isArray(d.items)) {
      d.items = d.items.map(item => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return item;
        const title = String(item.heading || "").toLowerCase();
        return { ...item, icon: item.icon ?? (/hij|famil|cuidado|persona/.test(title) ? "users" : /aliment|pago|económ|honorario|deuda/.test(title) ? "coins" : /bien|hogar|patrimon/.test(title) ? "house" : /acuerdo|contrat|document/.test(title) ? "file-text" : "scale"), ...(item.href && !item.link_label ? { link_label: "Conocer el servicio" } : {}) };
      });
    }
    if (Array.isArray(d.actions)) d.actions = d.actions.map((action, index) => action && typeof action === "object" && !Array.isArray(action) ? { ...action, icon: action.icon ?? "arrow-up-right", style: action.style ?? (index ? "text" : "primary") } : action);
    if (block.type === "cta" && options.whatsappHref && Array.isArray(d.actions) && !d.actions.some(a => a && typeof a === "object" && !Array.isArray(a) && a.href === options.whatsappHref)) {
      d.actions.push({ label: "Escríbenos por WhatsApp", href: options.whatsappHref, icon: "message-circle", style: "text" });
    }
    return block;
  });
  const closing = new Set(["related_content", "faq", "cta"]);
  const reading = result.blocks.filter(block => !closing.has(block.type));
  const intro = reading.findIndex(block => ["split_content", "rich_text"].includes(block.type));
  if (!result.blocks.some(block => block.variant === "benefits")) reading.splice(intro >= 0 ? intro + 1 : reading[0]?.type === "hero" ? 1 : 0, 0, ...serviceStarterBlocks(makeKey));
  result.blocks = [...reading, ...result.blocks.filter(b => b.type === "related_content"), ...result.blocks.filter(b => b.type === "faq"), ...result.blocks.filter(b => b.type === "cta")];
  if (!result.blocks.some(b => b.type === "cta") && options.contactPath) result.blocks.push({
    key: makeKey(), type: "cta", schema_version: 1, variant: "default", assets: [], data: {
      eyebrow: "Conversemos sobre tu caso", heading: "Demos el siguiente paso.", body: "Cuéntanos qué necesitas resolver y revisemos cómo podemos ayudarte.",
      actions: [{ label: "Evaluar mi caso", href: options.contactPath, icon: "arrow-up-right", style: "primary" }, ...(options.whatsappHref ? [{ label: "Escríbenos por WhatsApp", href: options.whatsappHref, icon: "message-circle", style: "text" }] : [])],
    },
  });
  result.template_version = 2;
  return result;
}
