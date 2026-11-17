"use client";

import { useCallback, useState, type CSSProperties } from "react";
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
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  fit?: "cover" | "contain";
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  style?: CSSProperties;
  imageStyle?: CSSProperties;
};

/** Reserves layout space and keeps loading/error states consistent across the site and admin. */
export function MediaImage(props: MediaImageProps) {
  return <ImageContent key={props.src} {...props} />;
}

function ImageContent({
  src,
  srcSet,
  sizes,
  alt,
  width = 1600,
  height = 900,
  className,
  imageClassName,
  fit = "cover",
  loading = "lazy",
  fetchPriority,
  style,
  imageStyle,
}: MediaImageProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [useOriginal, setUseOriginal] = useState(false);
  const imageRef = useCallback((node: HTMLImageElement | null) => {
    // A cached image can finish before hydration attaches its load listener.
    if (!node?.complete) return;
    if (node.naturalWidth > 0) setState("ready");
    else if (node.currentSrc && srcSet && !useOriginal) setUseOriginal(true);
  }, [srcSet, useOriginal]);
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
        // The original URL also supports blob previews and URLs without a responsive variant.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          key={attempt}
          sizes={useOriginal ? undefined : sizes}
          srcSet={useOriginal ? undefined : srcSet}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          style={imageStyle}
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "contain" ? "object-contain" : "object-cover",
            imageClassName,
          )}
          onLoad={() => setState("ready")}
          onError={() => {
            if (srcSet && !useOriginal) {
              setUseOriginal(true);
            } else setState("error");
          }}
        />
      )}
    </div>
  );
}
