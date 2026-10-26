import type { Block, Json } from "../admin/types";
import { actionStyles, iconOptions, richLayouts, toneOptions, visualOptions } from "./block-options";
export function validatePresentation(block: Block) {
  const d = block.data;
  const choice = (value: Json | undefined, options: object, field: string) => {
    if (value !== undefined && (typeof value !== "string" || !Object.hasOwn(options, value))) throw new Error(`Opción inválida: ${field}.`);
  };
  for (const field of ["lead", "note", "aria_label", "eyebrow", "attribution"]) if (d[field] !== undefined && typeof d[field] !== "string") throw new Error(`${field} debe ser texto.`);
  if (d.hidden !== undefined && typeof d.hidden !== "boolean") throw new Error("La visibilidad debe ser booleana.");
  choice(d.visual, visualOptions, "apoyo visual");
  choice(d.tone, toneOptions, "superficie");
  choice(d.layout, richLayouts, "distribución");
  choice(d.note_icon, iconOptions, "icono de nota");
  choice(d.columns, { auto: true, "1": true, "2": true, "3": true, "4": true }, "columnas");
  if (Array.isArray(d.items)) for (const item of d.items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    choice(item.icon, iconOptions, "icono");
    for (const field of ["asset_slot", "link_label"]) if (item[field] !== undefined && typeof item[field] !== "string") throw new Error(`${field} debe ser texto.`);
    if (item.asset_slot && !block.assets.some(asset => asset.slot === item.asset_slot)) throw new Error("La imagen de un elemento debe estar asociada al bloque.");
  }
  if (Array.isArray(d.actions)) for (const action of d.actions) {
    if (!action || typeof action !== "object" || Array.isArray(action)) continue;
    choice(action.icon, iconOptions, "icono del botón");
    choice(action.style, actionStyles, "estilo del botón");
  }
  for (const asset of block.assets) {
    const point = asset.focal_point;
    if (point !== undefined && (!point || typeof point !== "object" || Array.isArray(point) || [point.x, point.y].some(v => typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1))) throw new Error("El punto focal debe estar entre 0 y 100% en ambos ejes.");
  }
}
