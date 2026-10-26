"use client";
import { ArrowUp, ArrowDown, Copy, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { RichTextEditor } from "./rich-text-editor";
import { iconOptions, visualOptions, toneOptions, actionStyles, richLayouts, blockVariants } from "@/lib/content/block-options";
import { ContentIcon } from "@/components/public/content-icon";
import { AssetPicker } from "./asset-picker";
import type { Block, Json } from "@/lib/admin/types";

export const blockLabels: Record<string, string> = {
  hero: "Portada",
  split_content: "Texto e imagen",
  card_grid: "Tarjetas",
  benefits: "Franja de beneficios",
  checklist: "Lista de requisitos",
  steps: "Etapas",
  faq: "Preguntas frecuentes",
  cta: "Llamado a la acción",
  rich_text: "Texto enriquecido",
  image: "Imagen",
  quote: "Cita",
  related_content: "Contenidos relacionados",
};
export function makeBlock(type: string): Block {
  const benefits = type === "benefits";
  if (benefits) type = "card_grid";
  const data: Record<string, Json> = (
    {
      hero: { eyebrow: "", heading: "", lead: "", body: "", note: "", note_icon: "none", visual: "none", actions: [] },
      split_content: { heading: "", body: "", visual: "none", actions: [] },
      card_grid: { aria_label: "", items: [{ heading: "", body: "", icon: "none" }], ...(benefits ? { tone: "sage", columns: "4" } : {}) },
      checklist: { visual: "none", items: [{ text: "" }] },
      steps: { items: [{ heading: "", body: "" }] },
      faq: { items: [{ question: "", answer: "" }] },
      cta: { heading: "", actions: [{ label: "", href: "/contacto", icon: "none", style: "primary" }] },
      rich_text: { layout: "reading", visual: "none", document: { type: "doc", content: [] } },
      image: { caption: "" },
      quote: { text: "", attribution: "" },
      related_content: { heading: "También te puede interesar" },
    } as Record<string, Record<string, Json>>
  )[type];
  return {
    key: crypto.randomUUID(),
    type,
    schema_version: 1,
    variant: benefits ? "benefits" : "default",
    data,
    assets: [],
  };
}
function RepeatFields({
  items,
  fields,
  onChange,
  label,
  media,
}: {
  items: Json;
  fields: { key: string; label: string; options?: Record<string, string> }[];
  onChange: (items: Json[]) => void;
  label: string;
  media?: { canUpload: boolean; assets: Block["assets"]; set: (index: number, id: string | null) => void };
}) {
  const rows = Array.isArray(items) ? (items as Record<string, Json>[]) : [];
  return (
    <div className="space-y-3">
      <p className="font-medium">{label}</p>
      {rows.map((r, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Elemento {index + 1}</span>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                type="button"
                disabled={index === 0}
                aria-label="Subir elemento"
                onClick={() => {
                  const next = [...rows];
                  [next[index - 1], next[index]] = [
                    next[index],
                    next[index - 1],
                  ];
                  onChange(next);
                }}
              >
                <ArrowUp />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                type="button"
                aria-label="Quitar elemento"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          {fields.map((f) => (
            <label key={f.key} className="panel-field text-sm">
              {f.label}
              {f.options ? <div className="flex items-center gap-3"><Select aria-label={f.label} value={String(r[f.key] || (f.key === "style" ? "primary" : "none"))} onChange={e => onChange(rows.map((v, i) => i === index ? { ...v, [f.key]: e.target.value } : v))}>{Object.entries(f.options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>{f.key === "icon" && <ContentIcon name={r[f.key]} />}</div> : <Textarea
                aria-label={f.label}
                rows={f.key === "body" || f.key === "answer" ? 3 : 1}
                value={String(r[f.key] || "")}
                onChange={(e) =>
                  onChange(
                    rows.map((v, i) =>
                      i === index ? { ...v, [f.key]: e.target.value } : v,
                    ),
                  )
                }
              />}
            </label>
          ))}
          {media && <AssetPicker canUpload={media.canUpload} label="Imagen del elemento" value={media.assets.find(asset => asset.slot === r.asset_slot)?.asset_id || null} onChange={id => media.set(index, id)} />}

        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            Object.fromEntries(fields.map((f) => [f.key, f.key === "icon" ? "none" : f.key === "style" ? "primary" : ""])),
          ])
        }
      >
        <Plus />
        Agregar elemento
      </Button>
    </div>
  );
}
export function BlockEditor({
  block,
  index,
  total,

  canUpload,
  disabled = false,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  block: Block;
  index: number;
  total: number;

  canUpload: boolean;
  disabled?: boolean;
  onChange: (b: Block) => void;
  onMove: (direction: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const set = (key: string, value: Json) =>
    onChange({ ...block, data: { ...block.data, [key]: value } });
  const data = block.data;
  return (
    <details open className="editor-block">
      <summary>
        {index + 1}. {block.variant === "benefits" ? blockLabels.benefits : blockLabels[block.type] || block.type}
      </summary>
      <div className="mt-4 space-y-5">
        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              type="button"
              aria-label="Subir bloque"
              disabled={!index}
              onClick={() => onMove(-1)}
            >
              <ArrowUp />
            </Button>
            <Button
              size="icon"
              variant="outline"
              type="button"
              aria-label="Bajar bloque"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
            >
              <ArrowDown />
            </Button>
            <Button
              size="icon"
              variant="outline"
              type="button"
              aria-label="Duplicar bloque"
              onClick={onDuplicate}
            >
              <Copy />
            </Button>
          </div>
          <Button size="sm" variant="ghost" type="button" onClick={onRemove}>
            <Trash2 />
            Quitar bloque
          </Button>
        </div>
        <div className="panel-field">
          <Label htmlFor={`${block.key}-variant`}>Composición visual</Label>
          <Select
            id={`${block.key}-variant`}
            value={block.variant}
            onChange={(e) => onChange({ ...block, variant: e.target.value })}
          >
            {Object.entries(blockVariants).filter(([value]) => value !== "benefits" || block.type === "card_grid").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={data.hidden === true} onChange={e => set("hidden", e.target.checked)} />Ocultar sección en la página</label>
        <label className="panel-field">Superficie<Select aria-label="Superficie" value={String(data.tone || "default")} onChange={e => set("tone", e.target.value)}>{Object.entries(toneOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
        {["hero", "split_content", "checklist", "rich_text", "cta"].includes(block.type) && <label className="panel-field">Apoyo visual<Select aria-label="Apoyo visual" value={String(data.visual || (block.assets.length ? "image" : "none"))} onChange={e => set("visual", e.target.value)}>{Object.entries(visualOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
        {["card_grid", "steps"].includes(block.type) && <label className="panel-field">Columnas en escritorio<Select aria-label="Columnas en escritorio" value={String(data.columns || "auto")} onChange={e => set("columns", e.target.value)}>{["auto", "1", "2", "3", "4"].map(value => <option key={value} value={value}>{value === "auto" ? "Automáticas" : value}</option>)}</Select></label>}
        {block.type === "rich_text" && <label className="panel-field">Distribución del texto<Select aria-label="Distribución del texto" value={String(data.layout || "reading")} onChange={e => set("layout", e.target.value)}>{Object.entries(richLayouts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
        {["eyebrow", "heading", "lead", "body", "note", "aria_label", "text", "caption", "attribution"]
          .filter(
            (k) =>
              k in data ||
              ([
                "hero",
                "split_content",
                "card_grid",
                "checklist",
                "steps",
                "faq",
                "cta",
                "related_content",
              ].includes(block.type) &&
                ["eyebrow", "heading", "body", "aria_label", ...(block.type === "hero" ? ["lead", "note"] : [])].includes(k)),
          )
          .map((k) => (
            <div className="panel-field" key={k}>
              <Label htmlFor={`${block.key}-${k}`}>
                {
                  (
                    {
                      eyebrow: "Antetítulo",
                      lead: "Bajada destacada",
                      note: "Nota de apoyo",
                      aria_label: "Nombre accesible de la sección",
                      heading: "Encabezado",
                      body: "Texto",
                      text: "Cita",
                      caption: "Leyenda",
                      attribution: "Atribución",
                    } as Record<string, string>
                  )[k]
                }
              </Label>
              <Textarea
                id={`${block.key}-${k}`}
                rows={k === "body" || k === "text" ? 4 : 2}
                value={String(data[k] || "")}
                onChange={(e) => set(k, e.target.value)}
              />
            </div>
          ))}
        {block.type === "hero" && <label className="panel-field">Icono de la nota<Select aria-label="Icono de la nota" value={String(data.note_icon || "none")} onChange={e => set("note_icon", e.target.value)}>{Object.entries(iconOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>}
        {block.type === "related_content" && (
          <div className="panel-field">
            <Label htmlFor={`${block.key}-source`}>
              Contenido de la sección
            </Label>
            <Select
              id={`${block.key}-source`}
              value={String(data.source || "related")}
              onChange={(e) => set("source", e.target.value)}
            >
              <option value="related">
                Contenidos asociados a esta revisión
              </option>
              <option value="posts">Últimos artículos publicados</option>
              <option value="services">Servicios publicados</option>
              <option value="team">Equipo público</option>
            </Select>
          </div>
        )}
        {"items" in data && (
          <RepeatFields
            label="Elementos"
            items={data.items}
            fields={
              block.type === "faq"
                ? [
                    { key: "question", label: "Pregunta" },
                    { key: "answer", label: "Respuesta" },
                  ]
                : block.type === "checklist"
                  ? [{ key: "text", label: "Texto" }]
                  : [
                      { key: "heading", label: "Título" },
                      { key: "body", label: "Descripción" },
                      ...(block.type === "card_grid"
                        ? [
                            { key: "icon", label: "Icono", options: iconOptions },
                            { key: "link_label", label: "Texto del enlace" },
                            {
                              key: "href",
                              label: "Enlace del servicio · opcional",
                            },
                          ]
                        : []),
                    ]
            }
            media={block.type === "card_grid" ? { canUpload, assets: block.assets, set: (index, id) => {
              const rows = Array.isArray(data.items) ? data.items as Record<string, Json>[] : [];
              const slot = String(rows[index].asset_slot || `item-${crypto.randomUUID()}`);
              onChange({ ...block, data: { ...data, items: rows.map((row, i) => i === index ? { ...row, asset_slot: id ? slot : "" } : row) }, assets: [...block.assets.filter(asset => asset.slot !== slot), ...(id ? [{ asset_id: id, slot, alt_text: "" }] : [])] });
            } } : undefined}
            onChange={items => onChange({ ...block, data: { ...data, items }, assets: block.assets.filter(asset => !asset.slot.startsWith("item-") || items.some(item => item && typeof item === "object" && !Array.isArray(item) && item.asset_slot === asset.slot)) })}
          />
        )}
        {(["hero", "split_content", "cta"].includes(block.type) || "actions" in data) && (
          <RepeatFields
            label="Botones"
            items={data.actions}
            fields={[
              { key: "label", label: "Texto del botón" },
              { key: "href", label: "Destino · ruta, HTTPS, mailto o tel" },
              { key: "icon", label: "Icono del botón", options: iconOptions },
              { key: "style", label: "Estilo del botón", options: actionStyles },
            ]}
            onChange={(v) => set("actions", v)}
          />
        )}
        {block.type === "rich_text" && (
          <RichTextEditor
            disabled={disabled}
            id={`${block.key}-document`}
            value={data.document}
            onChange={(v) => set("document", v)}
          />
        )}
        <div className="space-y-3">
          <p className="font-medium">Recursos del bloque</p>
          {block.assets.map((a, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-3">
              <label className="panel-field">
                Espacio del recurso
                <Input
                  value={a.slot}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      assets: block.assets.map((v, n) =>
                        n === i ? { ...v, slot: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
              <label className="panel-field">
                Texto alternativo
                <Input
                  value={a.alt_text}
                  onChange={(e) =>
                    onChange({
                      ...block,
                      assets: block.assets.map((v, n) =>
                        n === i ? { ...v, alt_text: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-3">{["x", "y"].map(axis => <label className="panel-field text-sm" key={axis}>Punto focal {axis === "x" ? "horizontal" : "vertical"} (%)<Input type="number" min="0" max="100" value={Math.round(Number((a.focal_point && typeof a.focal_point === "object" && !Array.isArray(a.focal_point) ? a.focal_point[axis] : undefined) ?? .5) * 100)} onChange={e => onChange({ ...block, assets: block.assets.map((asset, n) => n === i ? { ...asset, focal_point: { x: .5, y: .5, ...(asset.focal_point && typeof asset.focal_point === "object" && !Array.isArray(asset.focal_point) ? asset.focal_point : {}), [axis]: Number(e.target.value) / 100 } } : asset) })} /></label>)}</div>
              <AssetPicker
                canUpload={canUpload}
                value={a.asset_id}
                onChange={(id) =>
                  onChange({
                    ...block,
                    assets: id
                      ? block.assets.map((v, n) =>
                          n === i ? { ...v, asset_id: id } : v,
                        )
                      : block.assets.filter((_, n) => n !== i),
                  })
                }
              />
            </div>
          ))}
          <AssetPicker
            canUpload={canUpload}
            value={null}
            label="Asociar recurso"
            onChange={(id) => {
              if (id)
                onChange({
                  ...block,
                  assets: [
                    ...block.assets,
                    {
                      asset_id: id,
                      slot: block.assets.length
                        ? `image-${block.assets.length + 1}`
                        : "image",
                      alt_text: "",
                    },
                  ],
                });
            }}
          />
        </div>
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Datos avanzados del bloque
          </summary>
          <JsonEditor
            value={data}
            onChange={(v) => onChange({ ...block, data: v })}
          />
        </details>
      </div>
    </details>
  );
}
export function JsonEditor({
  value,
  onChange,
}: {
  value: Record<string, Json>;
  onChange: (v: Record<string, Json>) => void;
}) {
  return (
    <textarea
      aria-label="Datos estructurados del bloque"
      className="mt-3 min-h-48 w-full rounded-lg border bg-background p-3 font-mono text-xs"
      defaultValue={JSON.stringify(value, null, 2)}
      key={JSON.stringify(value)}
      onBlur={(e) => {
        try {
          const parsed = JSON.parse(e.target.value);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
            throw new Error();
          e.target.setCustomValidity("");
          onChange(parsed);
        } catch {
          e.target.setCustomValidity("Escribe un objeto JSON válido.");
          e.target.reportValidity();
        }
      }}
    />
  );
}
