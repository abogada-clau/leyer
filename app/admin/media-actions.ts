"use server";
import { randomUUID, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireSite, checked } from "@/lib/admin/server";
import { serviceClient } from "@/lib/admin/service";
import { optimizeImage } from "@/lib/media/process-image";
import { uuid } from "@/lib/admin/validation";
import type { Asset, ActionResult } from "@/lib/admin/types";
export async function createPublicCopy(

  assetId: string,
): Promise<ActionResult> {
  try {
    const { db, site, user } = await requireSite("media.manage");
    const asset = checked(
      await db
        .rpc("get_cms_media", { p_site_id: site.id })
        .eq("id", uuid(assetId))
        .single(),
    ) as Asset;
    if (asset.bucket_id !== "cms-private")
      throw new Error("El recurso ya es público.");
    const file = checked(
      await db.storage.from(asset.bucket_id).download(asset.storage_path),
    );
    if (!file) throw new Error("No se encontró el archivo privado.");
    const original = Buffer.from(await file.arrayBuffer());
    const optimized =
      asset.mime_type === "application/pdf"
        ? null
        : await optimizeImage(original, asset.filename);
    const bytes = optimized?.data || original;
    const filename = optimized?.filename || asset.filename;
    const id = randomUUID();
    const storagePath = `${site.id}/${id}/${filename}`;
    // Revalidate after download/optimization, independently of cached render context.
    const context = checked(
      await db.rpc("get_media_upload_context"),
    );
    if (!context?.length)
      throw new Error("Tu acceso fue revocado antes de guardar.");
    const admin = serviceClient();
    checked(
      await admin
        .from("media_assets")
        .insert({
          id,
          site_id: site.id,
          bucket_id: "cms-public",
          storage_path: storagePath,
          filename,
          mime_type: optimized ? "image/webp" : "application/pdf",
          byte_size: bytes.length,
          width: optimized?.width || null,
          height: optimized?.height || null,
          original_byte_size: optimized?.originalByteSize || null,
          optimization: optimized ? "webp-lossless-v1" : null,
          checksum_sha256: createHash("sha256").update(bytes).digest("hex"),
          alt_text: asset.alt_text,
          credits: asset.credits,
          created_by: user.id,
        }),
    );
    const result = await admin.storage
      .from("cms-public")
      .upload(storagePath, bytes, {
        contentType: optimized ? "image/webp" : "application/pdf",
        upsert: false,
        cacheControl: "31536000",
      });
    if (result.error) {
      await admin.storage.from("cms-public").remove([storagePath]);
      await admin.from("media_assets").delete().eq("id", id);
      throw new Error(
        "No se pudo guardar la copia pública. Intenta nuevamente.",
      );
    }
    revalidatePath("/admin/media");
    return {
      id,
      message:
        "Copia pública creada. Selecciónala en una nueva revisión para publicar. El original privado se conserva.",
    };
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "No se pudo crear la copia pública.",
    };
  }
}
