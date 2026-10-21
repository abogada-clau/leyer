import { lookup } from "node:dns/promises";
import { request } from "node:https";
import ipaddr from "ipaddr.js";
import { MediaError } from "./process-image";
import { MAX_MEDIA_BYTES } from "./shared";

export function isPublicAddress(address: string) {
  try {
    const parsed = ipaddr.process(address);
    return (
      parsed.range() === "unicast" &&
      (parsed.kind() === "ipv4" ||
        (parsed as ipaddr.IPv6).parts[0] >>> 13 === 1)
    );
  } catch {
    return false;
  }
}

export function parseImageUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new MediaError("Escribe una URL HTTPS completa.");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    raw.length > 2048 ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !hostname.includes(".") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".internal") ||
    (ipaddr.isValid(hostname) && !isPublicAddress(hostname))
  ) {
    throw new MediaError(
      "Usa una URL HTTPS pública, sin credenciales ni puertos especiales.",
    );
  }
  return url;
}

/** Every redirect resolves again; the HTTPS connection is pinned to that validated IP. */
export async function downloadImage(raw: string, signal?: AbortSignal) {
  const combined = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(20_000)])
    : AbortSignal.timeout(20_000);
  let url = parseImageUrl(raw);
  for (let redirect = 0; redirect <= 3; redirect++) {
    combined.throwIfAborted();
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = await lookup(hostname, { all: true });
    if (
      !addresses.length ||
      addresses.some(({ address }) => !isPublicAddress(address))
    ) {
      throw new MediaError(
        "La URL debe apuntar a una dirección pública de Internet.",
      );
    }
    combined.throwIfAborted();
    const selected = addresses[0];
    const result = await new Promise<{ data?: Buffer; location?: string }>(
      (resolve, reject) => {
        const req = request(
          url,
          {
            agent: false,
            signal: combined,
            // Avoid a second DNS resolution (including DNS rebinding), retaining TLS hostname verification.
            lookup: (_host, options, callback) => {
              if (options.all) callback(null, [selected]);
              else callback(null, selected.address, selected.family);
            },
            headers: {
              Accept: "image/*",
              "Accept-Encoding": "identity",
              "User-Agent": "Leyer-Media/1.0",
            },
          },
          (res) => {
            if (
              [301, 302, 303, 307, 308].includes(res.statusCode || 0) &&
              res.headers.location
            ) {
              res.destroy();
              resolve({ location: res.headers.location });
              return;
            }
            if (res.statusCode !== 200) {
              res.destroy();
              reject(
                new MediaError(
                  "No se pudo descargar la imagen. Revisa que el enlace sea público.",
                  422,
                ),
              );
              return;
            }
            if (
              !res.headers["content-type"]
                ?.toLowerCase()
                .startsWith("image/") ||
              (res.headers["content-encoding"] &&
                res.headers["content-encoding"] !== "identity")
            ) {
              res.destroy();
              reject(
                new MediaError(
                  "El enlace debe descargar directamente una imagen.",
                  415,
                ),
              );
              return;
            }
            if (Number(res.headers["content-length"]) > MAX_MEDIA_BYTES) {
              res.destroy();
              reject(new MediaError("La imagen supera los 25 MB.", 413));
              return;
            }
            const chunks: Buffer[] = [];
            let size = 0;
            res.on("data", (chunk: Buffer) => {
              size += chunk.length;
              if (size > MAX_MEDIA_BYTES) {
                res.destroy();
                reject(new MediaError("La imagen supera los 25 MB.", 413));
              } else chunks.push(chunk);
            });
            res.on("end", () => resolve({ data: Buffer.concat(chunks) }));
            res.on("error", reject);
          },
        );
        req.on("error", reject);
        req.end();
      },
    );
    if (result.data) {
      let filename = url.pathname.split("/").pop() || "imagen";
      try {
        filename = decodeURIComponent(filename);
      } catch {
        /* Keep the safely sanitized encoded name. */
      }
      return { data: result.data, filename };
    }
    url = parseImageUrl(new URL(result.location!, url).href);
  }
  throw new MediaError("El enlace tiene demasiadas redirecciones.", 422);
}
