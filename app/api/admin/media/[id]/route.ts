import { createClient } from "@/lib/supabase/server";
import type { Asset } from "@/lib/admin/types";
import { uuid } from "@/lib/admin/validation";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user)
      return Response.json({ error: "Inicia sesión." }, { status: 401 });
    const { id } = await params;
    const siteId = uuid(new URL(request.url).searchParams.get("site"));
    const { data: record, error } = await db
      .rpc("get_cms_media", { p_site_id: siteId })
      .eq("id", uuid(id))
      .single();
    const data = record as Asset | null;
    if (error || !data)
      return Response.json(
        { error: "Recurso no autorizado." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    let url: string;
    if (data.bucket_id === "cms-public")
      url = db.storage.from(data.bucket_id).getPublicUrl(data.storage_path)
        .data.publicUrl;
    else {
      const signed = await db.storage
        .from(data.bucket_id)
        .createSignedUrl(data.storage_path, 60);
      if (signed.error || !signed.data)
        throw new Error("No se pudo renovar el acceso privado.");
      url = signed.data.signedUrl;
    }
    return Response.json(
      { url, expiresIn: data.bucket_id === "cms-private" ? 60 : null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json(
      { error: "No se pudo abrir el recurso." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
