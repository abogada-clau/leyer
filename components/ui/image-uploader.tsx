"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import {
  CheckCircle2,
  Download,
  ImagePlus,
  Link2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { uploadImage, type ImageSource } from "@/lib/media/client";
import {
  formatBytes,
  IMAGE_ACCEPT,
  MAX_MEDIA_BYTES,
  type ImageUploadPhase,
  type MediaTarget,
  type UploadedImage,
} from "@/lib/media/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { MediaImage } from "@/components/ui/media-image";
import { cn } from "@/lib/utils";

export type ImageUploaderProps = {
  label?: string;
  /** Omit target for a public conversion/download preview without saving to Storage. */
  target?: MediaTarget;
  onChange?: (image: UploadedImage | null) => void;
  disabled?: boolean;
  className?: string;
};

export function ImageUploader({
  label = "Imagen del contenido",
  target,
  onChange,
  disabled,
  className,
}: ImageUploaderProps) {
  const id = useId();
  const [mode, setMode] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [phase, setPhase] = useState<
    ImageUploadPhase | "idle" | "success" | "error"
  >("idle");
  const [percent, setPercent] = useState<number>();
  const [error, setError] = useState("");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const previewUrl = useRef("");
  const lastSource = useRef<ImageSource | null>(null);
  const busy = ["sending", "downloading", "optimizing", "saving"].includes(
    phase,
  );
  const inactive = disabled || busy;

  useEffect(
    () => () => {
      controller.current?.abort();
      if (previewUrl.current.startsWith("blob:"))
        URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  function clearImage() {
    if (previewUrl.current.startsWith("blob:"))
      URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = "";
    setImage(null);
    onChange?.(null);
  }

  async function start(source: ImageSource) {
    if (disabled || controller.current) return;
    lastSource.current = source;
    setError("");
    if (
      source.file &&
      (!source.file.size || source.file.size > MAX_MEDIA_BYTES)
    ) {
      setError("Elige una imagen de hasta 25 MB.");
      setPhase("error");
      return;
    }
    clearImage();
    const current = new AbortController();
    controller.current = current;
    setPhase("sending");
    setPercent(0);
    try {
      const result = await uploadImage(source, {
        target,
        alt,
        signal: current.signal,
        onProgress: (step, progress) => {
          setPhase(step);
          setPercent(progress);
        },
      });
      if (current.signal.aborted) {
        if (result.src.startsWith("blob:")) URL.revokeObjectURL(result.src);
        return;
      }
      previewUrl.current = result.src;
      setImage(result);
      setPhase("success");
      onChange?.(result);
    } catch (failure) {
      if (current.signal.aborted) return;
      setError(
        failure instanceof Error
          ? failure.message
          : "No se pudo cargar la imagen.",
      );
      setPhase("error");
    } finally {
      if (controller.current === current) controller.current = null;
    }
  }

  function cancel() {
    controller.current?.abort();
    controller.current = null;
    setPhase("idle");
    setError("");
    setPercent(undefined);
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (inactive) return;
    if (event.dataTransfer.files.length !== 1) {
      setError("Carga una imagen a la vez.");
      setPhase("error");
      return;
    }
    void start({ file: event.dataTransfer.files[0] });
  }

  const status =
    phase === "sending"
      ? `Enviando imagen${percent === undefined ? "…" : ` · ${percent}%`}`
      : phase === "downloading"
        ? target
          ? "Descargando, optimizando y guardando…"
          : "Descargando y optimizando…"
        : target
          ? "Optimizando y guardando…"
          : "Optimizando sin pérdida…";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
        <span className="rounded-lg bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground">
          WebP sin pérdida
        </span>
      </div>
      <fieldset
        disabled={inactive}
        className="space-y-4"
        aria-labelledby={`${id}-label`}
      >
        <legend className="sr-only">Origen de la imagen</legend>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "file" ? "secondary" : "ghost"}
            aria-pressed={mode === "file"}
            onClick={() => setMode("file")}
          >
            <Upload />
            Subir archivo
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "url" ? "secondary" : "ghost"}
            aria-pressed={mode === "url"}
            onClick={() => setMode("url")}
          >
            <Link2 />
            Adjuntar URL
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-alt`}>Texto alternativo</Label>
          <Input
            id={`${id}-alt`}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            maxLength={2000}
            placeholder="Describe lo que aporta la imagen"
          />
        </div>
        {mode === "file" ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!inactive) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={drop}
            className={cn(
              "rounded-xl border border-dashed border-border bg-muted/25 p-7 text-center transition-colors",
              dragging && "border-primary bg-secondary",
              inactive && "opacity-60",
            )}
          >
            <ImagePlus
              aria-hidden
              className="mx-auto mb-3 size-7 text-primary"
              strokeWidth={1.4}
            />
            <p className="text-sm font-medium">
              Arrastra una imagen hasta aquí
            </p>
            <p
              id={`${id}-help`}
              className="mt-1 text-xs leading-relaxed text-muted-foreground"
            >
              JPG, PNG, WebP, AVIF o GIF estático.
              <br />
              Hasta 25 MB y 24 megapíxeles.
            </p>
            <input
              ref={input}
              id={`${id}-file`}
              type="file"
              accept={IMAGE_ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-label="Seleccionar imagen"
              aria-describedby={`${id}-help`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void start({ file });
              }}
            />
            <Button
              className="mt-4"
              type="button"
              variant="outline"
              size="sm"
              onClick={() => input.current?.click()}
            >
              Elegir imagen
            </Button>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-border bg-muted/25 p-4">
            <Label htmlFor={`${id}-url`}>Enlace directo a la imagen</Label>
            <Input
              id={`${id}-url`}
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://ejemplo.cl/imagen.jpg"
              maxLength={2048}
              aria-describedby={`${id}-url-help`}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (url.trim()) void start({ url: url.trim() });
                }
              }}
            />
            <p
              id={`${id}-url-help`}
              className="text-xs leading-relaxed text-muted-foreground"
            >
              La imagen se descargará y convertirá antes de usarla.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!url.trim()}
              onClick={() => void start({ url: url.trim() })}
            >
              <Download />
              Importar imagen
            </Button>
          </div>
        )}
      </fieldset>
      {busy && (
        <div
          className="space-y-3 rounded-lg border border-border bg-card p-4"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-xs">
              <Loader2
                aria-hidden
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              {status}
            </span>
            <Button type="button" size="sm" variant="ghost" onClick={cancel}>
              <X />
              Cancelar
            </Button>
          </div>
          {phase === "sending" && percent !== undefined ? (
            <progress
              className="h-1.5 w-full accent-primary"
              value={percent}
              max={100}
              aria-label="Progreso del envío"
            />
          ) : (
            <progress
              className="h-1.5 w-full accent-primary"
              aria-label="Procesando la imagen"
            />
          )}
        </div>
      )}
      {phase === "error" && (
        <Alert variant="error" title="Revisa la imagen">
          <p>{error}</p>
          {lastSource.current && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={disabled}
              onClick={() => void start(lastSource.current!)}
            >
              Volver a intentar
            </Button>
          )}
        </Alert>
      )}
      {image && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-3">
          <MediaImage
            src={image.src}
            alt={alt}
            width={image.width}
            height={image.height}
            fit="contain"
            className="max-h-72 min-h-36 w-full"
            loading="eager"
          />
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="min-w-0 text-xs">
              <p className="flex items-center gap-1.5 font-medium text-success">
                <CheckCircle2 aria-hidden className="size-3.5" />
                {target ? "Imagen guardada" : "Imagen lista para descargar"}
              </p>
              <p className="mt-1 break-all">{image.filename}</p>
              <p className="mt-1 text-muted-foreground">
                {image.width} × {image.height} px ·{" "}
                {formatBytes(image.originalByteSize)} →{" "}
                {formatBytes(image.byteSize)}
              </p>
              <p className="mt-1 text-muted-foreground">
                {image.byteSize < image.originalByteSize
                  ? `${Math.round((1 - image.byteSize / image.originalByteSize) * 100)}% menos peso. Calidad conservada.`
                  : "Calidad conservada. El original ya tenía una compresión eficiente."}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {!target && (
                <Button asChild size="icon" variant="ghost">
                  <a
                    href={image.src}
                    download={image.filename}
                    aria-label="Descargar imagen WebP"
                  >
                    <Download />
                  </a>
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled}
                aria-label="Quitar imagen de la selección"
                onClick={() => {
                  clearImage();
                  setPhase("idle");
                }}
              >
                <X />
              </Button>
            </div>
          </div>
        </div>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {target
          ? target.bucket === "cms-private"
            ? "Destino privado. Solo el equipo autorizado podrá acceder."
            : "Destino público. La imagen será accesible mediante su enlace."
          : "Prueba pública: procesa la imagen y descarga el resultado. No se guarda en la biblioteca."}
      </p>
    </div>
  );
}
