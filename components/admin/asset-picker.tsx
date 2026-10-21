"use client";
import { useEffect, useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { ImageUploader } from "@/components/ui/image-uploader";
import { searchAssets } from "@/app/admin/actions";
import { AssetPreview } from "./asset-preview";
import type { Asset } from "@/lib/admin/types";
export function AssetPicker({
  siteId,
  value,
  onChange,
  label = "Seleccionar recurso",
  canUpload = false,
}: {
  siteId: string;
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  canUpload?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [reload, setReload] = useState(0);
  const [bucket, setBucket] = useState<"cms-public" | "cms-private">(
    "cms-private",
  );
  useEffect(() => {
    if (!open) return;
    let active = true;
    const timer = setTimeout(
      () =>
        start(async () => {
          try {
            const r = await searchAssets(siteId, query, page);
            if (active) {
              setRows(r.data || []);
              setTotal(r.total);
              setError("");
            }
          } catch {
            if (active)
              setError(
                "No pudimos consultar la biblioteca. Reintenta o comprueba tus permisos.",
              );
          }
        }),
      250,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [siteId, query, page, open, reload]);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => setOpen(true)}
        >
          {value ? "Cambiar recurso seleccionado" : label}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange(null)}
          >
            Quitar
          </Button>
        )}
      </div>
      {value && (
        <p className="mt-2 break-all text-xs text-muted-foreground">
          Recurso: {value}
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Biblioteca del sitio"
        description="Los recursos privados sirven para borradores. Para publicar, selecciona recursos del destino público."
      >
        <div className="space-y-4">
          <Input
            aria-label="Buscar recurso"
            placeholder="Buscar por nombre"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          {error && <Alert variant="error" title={error} />}
          <div aria-busy={pending} className="grid grid-cols-2 gap-3">
            {rows.map((a) => (
              <div className="rounded-lg border p-2" key={a.id}>
                <AssetPreview asset={a} />
                <p className="mt-2 truncate text-xs">{a.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {a.bucket_id === "cms-private" ? "Privado" : "Público"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  aria-label={`Seleccionar ${a.filename} (${a.bucket_id === "cms-private" ? "privado" : "público"})`}
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
          {!rows.length && (
            <p role="status">
              {pending
                ? "Cargando…"
                : "Sin recursos. Carga una imagen o prueba otra búsqueda."}
            </p>
          )}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={page === 1 || pending}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span>
              {page} · {total} recursos
            </span>
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={page * 20 >= total || pending}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
          {canUpload && (
            <details>
              <summary className="cursor-pointer text-sm font-medium">
                Cargar imagen nueva
              </summary>
              <div className="mt-4 space-y-3">
                <Select
                  aria-label="Destino de la imagen"
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value as typeof bucket)}
                >
                  <option value="cms-private">Privado · borradores</option>
                  <option value="cms-public">Público · difusión abierta</option>
                </Select>
                <ImageUploader
                  target={{ siteId, bucket }}
                  onChange={(image) => {
                    if (image?.assetId) {
                      onChange(image.assetId);
                      setReload(reload + 1);
                    }
                  }}
                />
              </div>
            </details>
          )}
        </div>
      </Dialog>
    </div>
  );
}
