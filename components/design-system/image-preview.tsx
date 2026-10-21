"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ImagePlaceholder, MediaImage } from "@/components/ui/media-image";
import { Button } from "@/components/ui/button";

export function ImagePreview() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="mb-5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground">
          ARCHIVO O URL · PRUEBA REAL
        </p>
        <ImageUploader label="Una imagen, muchas historias" />
      </div>
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground">
              EN HOMES, LANDINGS Y ARTÍCULOS
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setBroken(!broken)}
            >
              {broken ? "Restaurar imagen" : "Probar error"}
            </Button>
          </div>
          <MediaImage
            src={
              broken
                ? "/images/imagen-no-disponible.webp"
                : "/images/design-system-sample.webp"
            }
            alt="Ilustración arquitectónica de arcos en tonos pino y arena"
            loading="eager"
          />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            El espacio se conserva durante la carga. Si la imagen falla, se
            muestra una alternativa con reintento.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <p className="border-b border-border px-4 py-3 text-[10px] font-medium tracking-wider text-muted-foreground">
              CARGANDO
            </p>
            <ImagePlaceholder state="loading" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <p className="border-b border-border px-4 py-3 text-[10px] font-medium tracking-wider text-muted-foreground">
              SIN IMAGEN
            </p>
            <ImagePlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
