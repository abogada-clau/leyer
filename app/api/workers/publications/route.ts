import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { serviceClient } from "@/lib/admin/service";
export async function POST(request: Request) {
  const secret = process.env.WORKER_SECRET;
  const token =
    request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  if (
    !secret ||
    secret.length < 32 ||
    Buffer.byteLength(token) !== Buffer.byteLength(secret) ||
    !timingSafeEqual(Buffer.from(token), Buffer.from(secret))
  )
    return Response.json({ error: "No autorizado." }, { status: 401 });
  try {
    const db = serviceClient();
    const { data: processed, error } = await db.rpc(
      "process_scheduled_publications",
      { p_limit: 25 },
    );
    if (error) throw error;
    const { data: events, error: readError } = await db
      .from("publication_events")
      .select("id,site_id,entry_id")
      .is("processed_at", null)
      .order("id")
      .limit(100);
    if (readError) throw readError;
    for (const event of events || []) {
      const [routes, redirects] = await Promise.all([
        db.from("content_routes").select("path").eq("entry_id", event.entry_id),
        db
          .from("redirects")
          .select("from_path")
          .eq("target_entry_id", event.entry_id),
      ]);
      if (routes.error) throw routes.error;
      if (redirects.error) throw redirects.error;
      revalidateTag(`cms-site:${event.site_id}`, { expire: 0 });
      revalidateTag(`cms-entry:${event.entry_id}`, { expire: 0 });
      for (const path of [
        ...(routes.data || []).map((r) => r.path),
        ...(redirects.data || []).map((r) => r.from_path),
      ]) {
        if (path.length <= 1024) revalidatePath(path);
      }
      const { error: markError } = await db
        .from("publication_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("id", event.id);
      if (markError) throw markError;
    }
    const { data: siteEvents, error: siteError } = await db
      .from("site_cache_events")
      .select("id,site_id")
      .is("processed_at", null)
      .order("id")
      .limit(100);
    if (siteError) throw siteError;
    for (const event of siteEvents || []) {
      revalidateTag(`cms-site:${event.site_id}`, { expire: 0 });
      const { error: markError } = await db
        .from("site_cache_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("id", event.id);
      if (markError) throw markError;
    }
    const { data: rateWindowsExpired, error: cleanupError } = await db.rpc(
      "cleanup_contact_rate_windows",
    );
    if (cleanupError) throw cleanupError;
    revalidatePath("/admin", "layout");
    return Response.json(
      {
        scheduledProcessed: processed,
        rateWindowsExpired,
        invalidated: (events?.length || 0) + (siteEvents?.length || 0),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error(
      "Publication worker failed",
      e instanceof Error ? e.message : "Database operation failed",
    );
    return Response.json(
      {
        error:
          "El worker falló. Los eventos no completados se conservan para reintento.",
      },
      { status: 500 },
    );
  }
}
