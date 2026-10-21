import { createHash, randomUUID } from "node:crypto";
import { createClient as createStorageClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { MediaError, optimizeImage } from "@/lib/media/process-image";
import {
  assertSameOrigin,
  mediaErrorResponse,
  readMediaForm,
  reserveMediaJob,
} from "@/lib/media/request";
import { readImageSource } from "@/lib/media/source";

export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    assertSameOrigin(request);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !publicKey || !storageKey)
      throw new MediaError(
        "Configura Supabase para guardar imágenes en la biblioteca.",
        503,
      );
    const session = await createClient();
    const {
      data: { user },
      error: authError,
    } = await session.auth.getUser();
    if (authError || !user)
      throw new MediaError("Inicia sesión para guardar imágenes.", 401);
    release = reserveMediaJob();
    const form = await readMediaForm(request);
    const siteId = String(form.get("siteId") || "");
    const bucket = String(form.get("bucket") || "");
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        siteId,
      ) ||
      !["cms-public", "cms-private"].includes(bucket)
    )
      throw new MediaError("Selecciona un sitio y un destino válidos.");
    // User-scoped RPC checks active membership and media.manage before using server credentials.
    const { data: context, error: permissionError } = await session.rpc(
      "get_media_upload_context",
      { p_site_id: siteId },
    );
    if (permissionError || !context?.[0])
      throw new MediaError(
        "No tienes permiso para gestionar imágenes de este sitio.",
        403,
      );
    const source = await readImageSource(form, request.signal);
    const image = await optimizeImage(source.data, source.filename);
    request.signal.throwIfAborted();
    // Downloads/encoding can take time: honour permission revocations before persistence too.
    const { data: currentContext, error: currentPermissionError } =
      await session.rpc("get_media_upload_context", { p_site_id: siteId });
    if (currentPermissionError || !currentContext?.[0])
      throw new MediaError(
        "Ya no tienes permiso para guardar imágenes en este sitio.",
        403,
      );
    const admin = createStorageClient(supabaseUrl, storageKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const assetId = randomUUID();
    const organizationId = context[0].organization_id;
    const storagePath = `${organizationId}/${siteId}/${assetId}/${image.filename}`;
    const { error: assetError } = await admin.from("media_assets").insert({
      id: assetId,
      organization_id: organizationId,
      site_id: siteId,
      bucket_id: bucket,
      storage_path: storagePath,
      filename: image.filename,
      mime_type: "image/webp",
      byte_size: image.byteSize,
      width: image.width,
      height: image.height,
      original_byte_size: image.originalByteSize,
      optimization: "webp-lossless-v1",
      checksum_sha256: createHash("sha256").update(image.data).digest("hex"),
      alt_text: String(form.get("alt") || "").slice(0, 2000),
      created_by: user.id,
    });
    if (assetError)
      throw new MediaError(
        "No se pudo registrar la imagen en la biblioteca.",
        502,
      );
    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(storagePath, image.data, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    if (uploadError) {
      // If the upload reached Storage before a network failure, remove it before its metadata.
      await admin.storage.from(bucket).remove([storagePath]);
      await admin.from("media_assets").delete().eq("id", assetId);
      throw new MediaError(
        "No se pudo guardar la imagen. Vuelve a intentarlo.",
        502,
      );
    }
    let src: string;
    if (bucket === "cms-public")
      src = admin.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
    else {
      const { data: signed } = await admin.storage
        .from(bucket)
        .createSignedUrl(storagePath, 3600);
      // The asset is saved even if generating its temporary preview URL fails.
      src = signed?.signedUrl || "";
    }
    return Response.json(
      {
        src,
        assetId,
        bucket,
        storagePath,
        filename: image.filename,
        width: image.width,
        height: image.height,
        byteSize: image.byteSize,
        originalByteSize: image.originalByteSize,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return mediaErrorResponse(error);
  } finally {
    release?.();
  }
}
