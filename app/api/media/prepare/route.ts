import { optimizeImage } from "@/lib/media/process-image";
import {
  assertSameOrigin,
  mediaErrorResponse,
  readMediaForm,
  reserveMediaJob,
} from "@/lib/media/request";
import { readImageSource } from "@/lib/media/source";

/** Public, bounded preview. Returns bytes only; it never writes to Storage. */
export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    assertSameOrigin(request);
    release = reserveMediaJob();
    const source = await readImageSource(
      await readMediaForm(request),
      request.signal,
    );
    const image = await optimizeImage(source.data, source.filename);
    return new Response(new Uint8Array(image.data), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Disposition": `attachment; filename="${image.filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Image-Width": String(image.width),
        "X-Image-Height": String(image.height),
        "X-Original-Bytes": String(image.originalByteSize),
        "X-Image-Filename": image.filename,
      },
    });
  } catch (error) {
    return mediaErrorResponse(error);
  } finally {
    release?.();
  }
}
