import { getImageProps } from "next/image";
import { MediaImage, type MediaImageProps } from "@/components/ui/media-image";
import type { PublicAsset } from "@/lib/public/types";

type Props = Omit<MediaImageProps, "src" | "srcSet" | "alt"> & { asset: PublicAsset; alt?: string };

export function PublicMediaImage({
  asset,
  alt = asset.alt_text,
  width = asset.width || 1600,
  height = asset.height || 1000,
  sizes = "(max-width: 600px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), 1160px",
  loading = "lazy",
  ...props
}: Props) {
  const responsive = asset.src.startsWith("https://") && /^image\/(webp|jpeg|png|avif)$/.test(asset.mime_type)
    ? getImageProps({ src: asset.src, alt, width, height, sizes: loading === "lazy" ? `auto, ${sizes}` : sizes }).props
    : null;
  return (
    <MediaImage
      {...props}
      src={asset.src}
      srcSet={responsive?.srcSet}
      sizes={responsive?.sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
    />
  );
}
