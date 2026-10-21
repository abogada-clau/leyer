import type { ImageUploadPhase, MediaTarget, UploadedImage } from "./shared";

export type ImageSource =
  | { file: File; url?: never }
  | { url: string; file?: never };

/** One entry point for local images and remote imports, in either CMS bucket. */
export function uploadImage(
  source: ImageSource,
  options: {
    target?: MediaTarget;
    alt?: string;
    signal: AbortSignal;
    onProgress?: (phase: ImageUploadPhase, percent?: number) => void;
  },
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    if (source.file) body.set("file", source.file);
    else body.set("url", source.url);
    if (options.target) {
      body.set("siteId", options.target.siteId);
      body.set("bucket", options.target.bucket);
      body.set("alt", options.alt || "");
    }
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      options.target ? "/api/media/images" : "/api/media/prepare",
    );
    xhr.responseType = options.target ? "json" : "blob";
    xhr.timeout = 65_000;
    const abort = () => xhr.abort();
    const cleanup = () => options.signal.removeEventListener("abort", abort);
    options.signal.addEventListener("abort", abort, { once: true });
    xhr.upload.onprogress = (event) => {
      options.onProgress?.(
        "sending",
        event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : undefined,
      );
    };
    xhr.upload.onload = () =>
      options.onProgress?.(source.url ? "downloading" : "optimizing");
    xhr.onerror = () => {
      cleanup();
      reject(
        new Error(
          "No se pudo conectar. Revisa tu conexión e intenta de nuevo.",
        ),
      );
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(
        new Error(
          "La imagen tardó demasiado en procesarse. Intenta con otra imagen.",
        ),
      );
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Carga cancelada", "AbortError"));
    };
    xhr.onload = async () => {
      cleanup();
      if (xhr.status < 200 || xhr.status >= 300) {
        let error = "No se pudo completar la carga.";
        try {
          const response = options.target
            ? xhr.response
            : JSON.parse(await (xhr.response as Blob).text());
          error = response?.error || error;
        } catch {
          /* Keep the readable fallback for non-JSON upstream failures. */
        }
        reject(new Error(error));
        return;
      }
      if (options.target) {
        resolve(xhr.response as UploadedImage);
        return;
      }
      const blob = xhr.response as Blob;
      resolve({
        src: URL.createObjectURL(blob),
        filename: xhr.getResponseHeader("X-Image-Filename") || "imagen.webp",
        width: Number(xhr.getResponseHeader("X-Image-Width")),
        height: Number(xhr.getResponseHeader("X-Image-Height")),
        byteSize: blob.size,
        originalByteSize: Number(xhr.getResponseHeader("X-Original-Bytes")),
      });
    };
    if (options.signal.aborted) {
      cleanup();
      reject(new DOMException("Carga cancelada", "AbortError"));
      return;
    }
    options.onProgress?.("sending", 0);
    xhr.send(body);
  });
}
