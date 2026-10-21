"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Upload } from "lucide-react";
import { AssetPreview } from "./asset-preview";
import { RecordForm } from "./resource-manager";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/patterns/content";
import { createPublicCopy } from "@/app/admin/media-actions";
import { mutate } from "@/app/admin/actions";
import { formatBytes } from "@/lib/media/shared";
import type { Asset, ActionResult } from "@/lib/admin/types";
export function MediaLibrary({
  rows,
  siteId,
  canManage,
}: {
  rows: Asset[];
  siteId: string;
  canManage: boolean;
}) {
  const [upload, setUpload] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [bucket, setBucket] = useState<"cms-private" | "cms-public">(
    "cms-private",
  );
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const [deleting, setDeleting] = useState(false);
  const [publicConfirm, setPublicConfirm] = useState(false);
  const router = useRouter();
  return (
    <div className="space-y-5">
      {result.message && <Alert variant="success" title={result.message} />}
      {result.error && !selected && !upload && (
        <Alert variant="error" title={result.error} />
      )}
      {canManage && (
        <Button
          onClick={() => {
            setResult({});
            setUpload(true);
          }}
        >
          <Upload />
          Cargar imagen o PDF
        </Button>
      )}
      {rows.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((asset) => (
            <div key={asset.id} className="panel-card !p-4">
              <AssetPreview asset={asset} />
              <div className="my-4 flex items-center justify-between gap-3">
                <p
                  className="min-w-0 truncate font-medium"
                  title={asset.filename}
                >
                  {asset.filename}
                </p>
                <Badge
                  variant={
                    asset.bucket_id === "cms-private" ? "neutral" : "warning"
                  }
                >
                  {asset.bucket_id === "cms-private" ? "Privado" : "Público"}
                </Badge>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                {asset.width && asset.height
                  ? `${asset.width} × ${asset.height} · `
                  : ""}
                {formatBytes(asset.byte_size)} · {asset.mime_type}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setResult({});
                  setSelected(asset);
                  setDeleting(false);
                  setPublicConfirm(false);
                }}
              >
                Ver detalles
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="Sin recursos para mostrar"
          description="Carga una imagen o un PDF, o ajusta los filtros de la biblioteca."
        />
      )}
      <Dialog
        open={upload}
        onOpenChange={setUpload}
        title="Cargar recursos del CMS"
        description={
          bucket === "cms-private"
            ? "Privado: solo el equipo con acceso al CMS puede consultar estos recursos."
            : "Público: cualquier persona que conozca la URL podrá descargar el archivo, incluso antes de publicarlo en una página."
        }
      >
        <div className="space-y-5">
          <div className="panel-field">
            <Label htmlFor="upload-bucket">Destino</Label>
            <Select
              id="upload-bucket"
              value={bucket}
              onChange={(e) => setBucket(e.target.value as typeof bucket)}
            >
              <option value="cms-private">Privado · borradores</option>
              <option value="cms-public">Público · difusión abierta</option>
            </Select>
          </div>
          <ImageUploader
            key={bucket}
            target={{ siteId, bucket }}
            onChange={(image) => {
              if (image?.assetId) {
                setResult({ message: "Imagen guardada en la biblioteca." });
                router.refresh();
              }
            }}
          />
          <form
            className="space-y-3 border-t pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              form.set("siteId", siteId);
              form.set("bucket", bucket);
              start(async () => {
                try {
                  const response = await fetch("/api/media/files", {
                    method: "POST",
                    body: form,
                  });
                  const data = await response.json();
                  setResult(
                    response.ok
                      ? { message: "PDF guardado sin alterar su formato." }
                      : { error: data.error },
                  );
                  if (response.ok) router.refresh();
                } catch {
                  setResult({
                    error: "No se pudo cargar el PDF. Intenta de nuevo.",
                  });
                }
              });
            }}
          >
            <Label htmlFor="pdf">Archivo PDF</Label>
            <Input
              id="pdf"
              name="file"
              type="file"
              accept="application/pdf"
              required
            />
            <Button type="submit" variant="outline" disabled={pending}>
              {pending ? "Cargando…" : "Guardar PDF"}
            </Button>
          </form>
          {result.error && <Alert variant="error" title={result.error} />}
          {result.message && <Alert variant="success" title={result.message} />}
        </div>
      </Dialog>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !pending) setSelected(null);
        }}
        title={selected?.filename || "Recurso"}
        description="Las versiones publicadas y los archivos asociados permanecen protegidos."
      >
        {selected && (
          <div className="space-y-5">
            <AssetPreview asset={selected} showLink />
            <p className="text-sm text-muted-foreground">
              {selected.bucket_id === "cms-private"
                ? "Privado · los enlaces se renuevan automáticamente cada 45 segundos."
                : "Público · accesible por URL."}
            </p>
            {canManage ? (
              <RecordForm
                fields={[
                  {
                    key: "alt_text",
                    label: "Texto alternativo",
                    type: "textarea",
                    maxLength: 2000,
                  },
                  { key: "credits", label: "Créditos", maxLength: 2000 },
                ]}
                initial={{ ...selected }}
                pending={pending}
                error={result.error}
                onSubmit={(data) =>
                  start(async () => {
                    const r = await mutate({
                      action: "media",
                      siteId,
                      id: selected.id,
                      data,
                    });
                    setResult(r);
                    if (!r.error) {
                      setSelected(null);
                      router.refresh();
                    }
                  })
                }
              />
            ) : (
              <>
                <p>{selected.alt_text || "Sin texto alternativo"}</p>
                <p>{selected.credits}</p>
              </>
            )}
            {canManage && (
              <>
                {selected.bucket_id === "cms-private" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => setPublicConfirm(true)}
                  >
                    Crear copia pública
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() => setDeleting(true)}
                >
                  Eliminar recurso
                </Button>
                {deleting && (
                  <Alert
                    variant="warning"
                    title="¿Eliminar este archivo y su registro?"
                  >
                    <p>
                      No podrás recuperarlo. Las referencias de contenido o
                      autores impiden eliminarlo.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleting(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const r = await mutate({
                              action: "media.delete",
                              siteId,
                              id: selected.id,
                              data: {},
                            });
                            setResult(r);
                            if (!r.error) {
                              setSelected(null);
                              router.refresh();
                            }
                          })
                        }
                      >
                        Confirmar eliminación
                      </Button>
                    </div>
                  </Alert>
                )}
              </>
            )}
            {publicConfirm && (
              <Alert variant="warning" title="La copia será pública por URL">
                <p>
                  Cualquier persona que conozca el enlace podrá descargarla. El
                  original privado se conserva.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPublicConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const r = await createPublicCopy(siteId, selected.id);
                        setResult(r);
                        if (!r.error) {
                          setPublicConfirm(false);
                          setSelected(null);
                          router.refresh();
                        }
                      })
                    }
                  >
                    Confirmar copia pública
                  </Button>
                </div>
              </Alert>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
