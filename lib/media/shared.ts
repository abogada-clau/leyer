export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 24_000_000;
export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/gif";

export type MediaBucket = "cms-public" | "cms-private";
export type MediaTarget = { siteId: string; bucket: MediaBucket };
export type ImageUploadPhase =
  | "sending"
  | "downloading"
  | "optimizing"
  | "saving";
export type UploadedImage = {
  src: string;
  filename: string;
  width: number;
  height: number;
  byteSize: number;
  originalByteSize: number;
  assetId?: string;
  bucket?: MediaBucket;
  storagePath?: string;
};

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
