"use client";
import { ArrowUp, ArrowDown, Copy, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { RichTextEditor } from "./rich-text-editor";
import { AssetPicker } from "./asset-picker";
import type { Block, Json } from "@/lib/admin/types";

export const blockLabels: Record<string, string> = {
  hero: "Portada",
  split_content: "Texto e imagen",
  card_grid: "Tarjetas",
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
  const data: Record<string, Json> = (
    {
      hero: { heading: "", body: "", actions: [] },
      split_content: { heading: "", body: "" },
      card_grid: { items: [{ heading: "", body: "" }] },
      checklist: { items: [{ text: "" }] },
      steps: { items: [{ heading: "", body: "" }] },
      faq: { items: [{ question: "", answer: "" }] },
      cta: { heading: "", actions: [{ label: "", href: "/contacto" }] },
      rich_text: { document: { type: "doc", content: [] } },
      image: { caption: "" },
      quote: { text: "", attribution: "" },
      related_content: { heading: "También te puede interesar" },
    } as Record<string, Record<string, Json>>
  )[type];
  return {
    key: crypto.randomUUID(),
    type,
    schema_version: 1,
    variant: "default",
    data,
    assets: [],
  };
}
function RepeatFields({
  items,
  fields,
  onChange,
  label,
}: {
  items: Json;
  fields: { key: string; label: string }[];
  onChange: (items: Json[]) => void;
  label: string;
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
              <Textarea
                rows={f.key === "body" || f.key === "answer" ? 3 : 1}
                value={String(r[f.key] || "")}
                onChange={(e) =>
                  onChange(
                    rows.map((v, i) =>
                      i === index ? { ...v, [f.key]: e.target.value } : v,
                    ),
                  )
                }
              />
            </label>
          ))}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            Object.fromEntries(fields.map((f) => [f.key, ""])),
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
  siteId,
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
  siteId: string;
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
        {index + 1}. {blockLabels[block.type] || block.type}
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
            {[
              ...new Set([
                "default",
                "image-right",
                "image-left",
                "centered",
                block.variant,
              ]),
            ].map((v) => (
              <option key={v} value={v}>
                {(
                  {
                    default: "Predeterminada",
                    "image-right": "Imagen a la derecha",
                    "image-left": "Imagen a la izquierda",
                    centered: "Centrada",
                  } as Record<string, string>
                )[v] || v}
              </option>
            ))}
          </Select>
        </div>
        {["eyebrow", "heading", "body", "text", "caption", "attribution"]
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
                ["eyebrow", "heading", "body"].includes(k)),
          )
          .map((k) => (
            <div className="panel-field" key={k}>
              <Label htmlFor={`${block.key}-${k}`}>
                {
                  (
                    {
                      eyebrow: "Antetítulo",
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
                            {
                              key: "href",
                              label: "Enlace del servicio · opcional",
                            },
                          ]
                        : []),
                    ]
            }
            onChange={(v) => set("items", v)}
          />
        )}
        {"actions" in data && (
          <RepeatFields
            label="Botones"
            items={data.actions}
            fields={[
              { key: "label", label: "Texto del botón" },
              { key: "href", label: "Destino · ruta, HTTPS, mailto o tel" },
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
              <AssetPicker
                siteId={siteId}
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
            siteId={siteId}
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
