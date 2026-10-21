import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { serviceClient } from "@/lib/admin/service";
import {
  assertSameOrigin,
  readMediaForm,
  mediaErrorResponse,
  reserveMediaJob,
} from "@/lib/media/request";
import { MediaError } from "@/lib/media/process-image";
export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    assertSameOrigin(request);
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new MediaError("Inicia sesión.", 401);
    release = reserveMediaJob();
    const form = await readMediaForm(request);
    const siteId = String(form.get("siteId") || "");
    const bucket = String(form.get("bucket") || "");
    if (!["cms-public", "cms-private"].includes(bucket))
      throw new MediaError("Destino inválido.");
    const { data: context, error } = await db.rpc("get_media_upload_context", {
      p_site_id: siteId,
    });
    if (error || !context?.[0])
      throw new MediaError(
        "No tienes permiso para cargar archivos en este sitio.",
        403,
      );
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size < 5 ||
      file.size > 25 * 1024 * 1024
    )
      throw new MediaError("Selecciona un PDF de hasta 25 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 5).toString() !== "%PDF-")
      throw new MediaError("El archivo no es un PDF válido.");
    const { data: current } = await db.rpc("get_media_upload_context", {
      p_site_id: siteId,
    });
    if (!current?.[0])
      throw new MediaError("Tu permiso fue revocado durante la carga.", 403);
    const admin = serviceClient();
    const id = randomUUID();
    const filename = `${
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .slice(0, 120) || "documento"
    }.pdf`;
    const storagePath = `${context[0].organization_id}/${siteId}/${id}/${filename}`;
    const { error: insertError } = await admin
      .from("media_assets")
      .insert({
        id,
        organization_id: context[0].organization_id,
        site_id: siteId,
        bucket_id: bucket,
        storage_path: storagePath,
        filename,
        mime_type: "application/pdf",
        byte_size: bytes.length,
        checksum_sha256: createHash("sha256").update(bytes).digest("hex"),
        created_by: user.id,
      });
    if (insertError) throw new MediaError(insertError.message, 502);
    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(storagePath, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      await admin.storage.from(bucket).remove([storagePath]);
      await admin.from("media_assets").delete().eq("id", id);
      throw new MediaError(uploadError.message, 502);
    }
    return Response.json(
      { id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return mediaErrorResponse(e);
  } finally {
    release?.();
  }
}
