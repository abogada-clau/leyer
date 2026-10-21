"use client";

import { useState, type CSSProperties } from "react";
import { ImageIcon, ImageOff, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ImagePlaceholder({
  state = "empty",
  className,
  onRetry,
}: {
  state?: "empty" | "loading" | "error";
  className?: string;
  onRetry?: () => void;
}) {
  const Icon =
    state === "loading" ? Loader2 : state === "error" ? ImageOff : ImageIcon;
  return (
    <div
      className={cn(
        "flex h-full min-h-36 flex-col items-center justify-center gap-2 bg-muted/60 p-5 text-center text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy={state === "loading"}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-6",
          state === "loading" && "animate-spin motion-reduce:animate-none",
        )}
        strokeWidth={1.5}
      />
      <span className="text-xs">
        {state === "loading"
          ? "Cargando imagen…"
          : state === "error"
            ? "No pudimos mostrar la imagen"
            : "Sin imagen"}
      </span>
      {state === "error" && onRetry && (
        <Button variant="ghost" size="sm" type="button" onClick={onRetry}>
          <RotateCcw />
          Reintentar
        </Button>
      )}
    </div>
  );
}

export type MediaImageProps = {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  fit?: "cover" | "contain";
  loading?: "eager" | "lazy";
  style?: CSSProperties;
  imageStyle?: CSSProperties;
};

/** Reserves layout space and keeps loading/error states consistent across the site and admin. */
export function MediaImage(props: MediaImageProps) {
  return <ImageContent key={props.src} {...props} />;
}

function ImageContent({
  src,
  alt,
  width = 1600,
  height = 900,
  className,
  imageClassName,
  fit = "cover",
  loading = "lazy",
  style,
  imageStyle,
}: MediaImageProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
      aria-busy={Boolean(src) && state === "loading"}
    >
      {(!src || state !== "ready") && (
        <div className="absolute inset-0">
          <ImagePlaceholder
            state={!src ? "empty" : state === "error" ? "error" : "loading"}
            onRetry={
              state === "error"
                ? () => {
                    setState("loading");
                    setAttempt(attempt + 1);
                  }
                : undefined
            }
          />
        </div>
      )}
      {src && state !== "error" && (
        // Already optimized WebP, blob previews and signed URLs must not be recompressed by next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={attempt}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          style={imageStyle}
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "contain" ? "object-contain" : "object-cover",
            state !== "ready" && "opacity-0",
            imageClassName,
          )}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
        />
      )}
    </div>
  );
}
