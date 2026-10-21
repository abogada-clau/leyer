import { downloadImage } from "./download-image";
import { MediaError } from "./process-image";

export async function readImageSource(form: FormData, signal: AbortSignal) {
  const file = form.get("file");
  const url = form.get("url");
  if (file instanceof File && file.size && !url) {
    return { data: Buffer.from(await file.arrayBuffer()), filename: file.name };
  }
  if (typeof url === "string" && url.trim() && !file)
    return downloadImage(url.trim(), signal);
  throw new MediaError(
    "Selecciona un archivo o adjunta una URL, una opción a la vez.",
  );
}
