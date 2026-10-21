import { MediaError } from "./process-image";
import { MAX_MEDIA_BYTES } from "./shared";

export function assertSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    throw new MediaError("La solicitud debe realizarse desde este sitio.", 403);
  }
}

/** Bound the streamed request before multipart parsing, including chunked bodies. */
export async function readMediaForm(request: Request) {
  const limit = MAX_MEDIA_BYTES + 16_384;
  if (Number(request.headers.get("content-length")) > limit)
    throw new MediaError("El archivo supera los 25 MB.", 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    throw new MediaError("Formato de solicitud inválido.");
  const reader = request.body?.getReader();
  if (!reader) throw new MediaError("Selecciona una imagen o escribe una URL.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new MediaError("El archivo supera los 25 MB.", 413);
      }
      chunks.push(value);
    }
    return await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type")! },
    }).formData();
  } catch (error) {
    if (error instanceof MediaError) throw error;
    throw new MediaError(
      "No pudimos leer el archivo. Intenta seleccionarlo de nuevo.",
    );
  } finally {
    reader.releaseLock();
  }
}

let active = 0;
let requests = 0;
let windowStart = 0;
/** Per-instance ceilings: no unbounded queue or client-controlled rate-limit keys. */
export function reserveMediaJob() {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    requests = 0;
    windowStart = now;
  }
  if (active >= 2 || requests >= 20)
    throw new MediaError(
      "Estamos procesando otras imágenes. Intenta de nuevo en un momento.",
      429,
    );
  active++;
  requests++;
  return () => {
    active--;
  };
}

export function mediaErrorResponse(error: unknown) {
  const message =
    error instanceof MediaError
      ? error.message
      : "No se pudo completar la carga. Intenta de nuevo.";
  return Response.json(
    { error: message },
    {
      status: error instanceof MediaError ? error.status : 500,
      headers: {
        "Cache-Control": "no-store",
        ...(error instanceof MediaError && error.status === 429
          ? { "Retry-After": "60" }
          : {}),
      },
    },
  );
}
