import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { materializeServiceContent } from "../lib/content/service-template";
import { validateSnapshot } from "../lib/admin/validation";
import type { Snapshot } from "../lib/admin/types";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const local = /^http:\/\/(127\.0\.0\.1|localhost):57321$/.test(url);
  const publish = process.argv.includes("--publish");
  let email = process.env.CMS_MIGRATION_EMAIL, password = process.env.CMS_MIGRATION_PASSWORD;
  if (local && (!email || !password)) ({ email, password } = JSON.parse(await readFile(".local/admin-accounts.json", "utf8")).admin);
  if (!email || !password) throw new Error("Configura CMS_MIGRATION_EMAIL y CMS_MIGRATION_PASSWORD para un usuario autorizado.");
  const db = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  function ok<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> { if (result.error) throw new Error(result.error.message); return result.data as NonNullable<T>; }
  const login = await db.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  const site = ok(await db.from("sites").select("id,settings").single());
  const siteId = site.id;
  const entries = ok(await db.rpc("get_cms_listing", { p_site_id: siteId }));
  const authors = ok(await db.from("authors").select("id,avatar_asset_id,display_name").eq("site_id", siteId));
  const menus = ok(await db.from("menu_items").select("external_url").eq("site_id", siteId));
  const whatsappHref = menus.map(item => item.external_url).find(href => typeof href === "string" && /^https:\/\/wa\.me\/\d{8,15}$/.test(href));
  let upgraded = 0, skipped = 0;
  for (const entry of entries) {
    if (!entry.revision_id || entry.archived_at) continue;
    const snapshot = ok(await db.rpc("get_cms_snapshot", { p_revision_id: entry.revision_id })) as Snapshot;
    if (snapshot.template_key !== "service-landing" || snapshot.template_version >= 2) continue;
    if (publish && entry.published_revision_id && entry.revision_id !== entry.published_revision_id) {
      console.log(`Pendiente: ${snapshot.path} tiene cambios editoriales sin publicar; se conserva.`); skipped++; continue;
    }
    const portrait = authors.find(author => snapshot.authors.includes(author.id) && author.avatar_asset_id);
    const assetId = snapshot.cover_asset_id || portrait?.avatar_asset_id;
    const updated = materializeServiceContent(snapshot, {
      heroAsset: assetId ? { asset_id: assetId, slot: "image", alt_text: portrait?.display_name || "", focal_point: { x: .5, y: .5 } } : undefined,
      contactPath: site.settings.contact_enabled ? site.settings.contact_path || "/contacto" : undefined,
      whatsappHref,
    });
    validateSnapshot(updated);
    const revision = ok(await db.rpc("save_content_revision", { p_entry_id: entry.id, p_expected_revision_id: entry.revision_id, p_content: updated }));
    ok(await db.rpc("set_revision_state", { p_revision_id: revision, p_state: publish && entry.published_revision_id ? "approved" : "in_review" }));
    if (publish && entry.published_revision_id) ok(await db.rpc("publish_content_revision", { p_revision_id: revision }));
    upgraded++;
  }
  console.log(`Servicios actualizados: ${upgraded}. Conflictos conservados: ${skipped}.`);
  await db.auth.signOut();
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
