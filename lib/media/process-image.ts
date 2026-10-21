import sharp from "sharp";
import { MAX_IMAGE_PIXELS, MAX_MEDIA_BYTES } from "./shared";

export class MediaError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "MediaError";
  }
}

export function webpFilename(name: string) {
  const base = name
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return `${base || "imagen"}.webp`;
}

function hasPngAnimation(input: Buffer) {
  if (input.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return false;
  for (let offset = 8; offset + 12 <= input.length; ) {
    const length = input.readUInt32BE(offset);
    if (offset + length + 12 > input.length) break;
    const type = input.toString("ascii", offset + 4, offset + 8);
    if (type === "acTL" && length >= 8)
      return input.readUInt32BE(offset + 8) > 1;
    if (type === "IDAT") break;
    offset += length + 12;
  }
  return false;
}

/** Decode real bytes, preserve dimensions/alpha, strip EXIF, retain the colour profile. */
export async function optimizeImage(input: Buffer, filename: string) {
  if (!input.length || input.length > MAX_MEDIA_BYTES) {
    throw new MediaError("La imagen debe pesar entre 1 byte y 25 MB.", 413);
  }
  try {
    // libvips may expose only the first APNG frame; inspect its animation control chunk.
    if (hasPngAnimation(input))
      throw new MediaError(
        "Esta imagen tiene animación. Usa una imagen estática para conservarla completa.",
        415,
      );
    const image = sharp(input, {
      limitInputPixels: MAX_IMAGE_PIXELS,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (
      !["jpeg", "png", "webp", "heif", "avif", "gif"].includes(
        metadata.format || "",
      )
    ) {
      throw new MediaError(
        "Elige una imagen JPG, PNG, WebP, AVIF o GIF estático.",
        415,
      );
    }
    if ((metadata.pages || 1) > 1) {
      throw new MediaError(
        "Esta imagen tiene varias páginas o animación. Usa una imagen estática para conservarla completa.",
        415,
      );
    }
    if (metadata.depth && metadata.depth !== "uchar") {
      throw new MediaError(
        "Exporta la imagen en 8 bits antes de cargarla para conservar su calidad en WebP.",
        415,
      );
    }
    const { data, info } = await image
      .autoOrient()
      .keepIccProfile()
      .webp({ lossless: true, effort: 6, exact: true })
      .timeout({ seconds: 25 })
      .toBuffer({ resolveWithObject: true });
    if (data.length > MAX_MEDIA_BYTES) {
      throw new MediaError(
        "El WebP sin pérdida supera los 25 MB. Usa una imagen de menor resolución.",
        413,
      );
    }
    return {
      data,
      filename: webpFilename(filename),
      width: info.width,
      height: info.height,
      byteSize: data.length,
      originalByteSize: input.length,
    };
  } catch (error) {
    if (error instanceof MediaError) throw error;
    throw new MediaError(
      "No pudimos procesar la imagen. Comprueba que no esté dañada y que no supere los 24 megapíxeles.",
      422,
    );
  }
}
