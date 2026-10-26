import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServerClient } from "@supabase/ssr";
import sharp from "sharp";

const origin = process.env.APP_URL || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
if (!/^http:\/\/(127\.0\.0\.1|localhost):57321$/.test(url)) throw new Error("Solo se admiten pruebas locales.");
const accounts = JSON.parse(readFileSync(".local/admin-accounts.json", "utf8"));
async function login(who: string) {
  const jar = new Map<string, string>();
  const db = createServerClient(url, key, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: values => values.forEach(c => jar.set(c.name, c.value)),
  } });
  assert.equal((await db.auth.signInWithPassword(accounts[who])).error, null);
  return { db, cookie: () => [...jar].map(([name, value]) => `${name}=${value}`).join("; ") };
}

test("direct administrator context has one site and no study selection", async () => {
  const { db } = await login("admin");
  const context = await db.rpc("get_admin_context");
  assert.equal(context.error, null);
  assert.equal(context.data.is_admin, true);
  assert(context.data.site.id);
  for (const field of ["organizations", "memberships", "sites", "super_admin"]) assert.equal(field in context.data, false);
  assert.equal((await db.from("sites").select("id")).data?.length, 1);
  assert((await db.from("sites").insert({ name: "Otro sitio" })).error);
  await db.auth.signOut();
});

test("unprivileged accounts cannot grant themselves access or see drafts", async () => {
  const { db } = await login("pending");
  const context = await db.rpc("get_admin_context");
  assert.equal(context.data.is_admin, false);
  assert.equal(context.data.site, null);
  assert((await db.from("profiles").update({ is_admin: true }).eq("id", accounts.pending.id)).error);
  assert.equal((await db.rpc("get_media_upload_context")).data?.length, 0);
  const { db: admin } = await login("admin");
  const site = (await admin.rpc("get_admin_context")).data.site;
  assert.deepEqual((await db.rpc("get_cms_entries", { p_site_id: site.id })).data, []);
  await db.auth.signOut();
  await admin.auth.signOut();
});

test("images upload and renew previews without a client-selected site", async () => {
  const { db, cookie } = await login("admin");
  const image = await sharp({ create: { width: 48, height: 32, channels: 4, background: "#557766" } }).png().toBuffer();
  const form = new FormData();
  form.set("bucket", "cms-private");
  form.set("file", new File([new Uint8Array(image)], "single-client.png", { type: "image/png" }));
  const uploaded = await fetch(origin + "/api/media/images", { method: "POST", headers: { origin, cookie: cookie() }, body: form });
  const data = await uploaded.json();
  assert.equal(uploaded.status, 201, JSON.stringify(data));
  assert.equal(data.storagePath.split("/").length, 3);
  try {
    const preview = await fetch(origin + `/api/admin/media/${data.assetId}`, { headers: { cookie: cookie() } });
    assert.equal(preview.status, 200);
    assert((await preview.json()).url);
    const blocked = await login("pending");
    const denied = await fetch(origin + `/api/admin/media/${data.assetId}`, { headers: { cookie: blocked.cookie() } });
    assert.equal(denied.status, 403);
    const deniedUpload = await fetch(origin + "/api/media/images", { method: "POST", headers: { origin, cookie: blocked.cookie() }, body: form });
    assert.equal(deniedUpload.status, 403);
    await blocked.db.auth.signOut();
  } finally {
    assert.equal((await db.storage.from("cms-private").remove([data.storagePath])).error, null);
    assert.equal((await db.from("media_assets").delete().eq("id", data.assetId)).error, null);
    await db.auth.signOut();
  }
});
