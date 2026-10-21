"use client";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { MediaImage, ImagePlaceholder } from "@/components/ui/media-image";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/admin/types";
export function AssetPreview({
  asset,
  showLink = false,
}: {
  asset: Asset;
  showLink?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    async function refresh() {
      try {
        const res = await fetch(
          `/api/admin/media/${asset.id}?site=${asset.site_id}`,
          { cache: "no-store", signal: abort.signal },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (active) {
          setUrl(data.url);
          setError("");
        }
      } catch (e) {
        if (active && !abort.signal.aborted) {
          setUrl("");
          setError(e instanceof Error ? e.message : "No se pudo cargar.");
        }
      }
    }
    refresh();
    const timer =
      asset.bucket_id === "cms-private"
        ? setInterval(refresh, 45000)
        : undefined;
    const focus = () => {
      if (asset.bucket_id === "cms-private") refresh();
    };
    window.addEventListener("focus", focus);
    return () => {
      active = false;
      abort.abort();
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [asset.id, asset.site_id, asset.bucket_id, attempt]);
  return (
    <div className="space-y-2">
      {asset.mime_type === "application/pdf" ? (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
          <FileText
            className="size-10 text-muted-foreground"
            aria-label="Documento PDF"
          />
        </div>
      ) : !url && !error ? (
        <div className="aspect-video">
          <ImagePlaceholder state="loading" />
        </div>
      ) : (
        <MediaImage
          src={url}
          alt={asset.alt_text || asset.filename}
          width={asset.width || 1600}
          height={asset.height || 900}
          fit="contain"
        />
      )}
      {error && (
        <div role="alert" className="text-xs text-destructive">
          {error}{" "}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAttempt(attempt + 1)}
          >
            Reintentar
          </Button>
        </div>
      )}
      {showLink && url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm underline underline-offset-4"
        >
          {asset.bucket_id === "cms-private"
            ? "Abrir enlace privado · vence en 1 minuto"
            : "Abrir recurso público"}
        </a>
      )}
    </div>
  );
}
