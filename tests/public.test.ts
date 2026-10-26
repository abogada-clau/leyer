import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createClient } from "@supabase/supabase-js";
const origin = process.env.APP_URL || "http://localhost:3000";
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:57321") throw new Error("Solo se admiten pruebas locales.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
const page = async (path: string) => { const response = await fetch(origin + path, { redirect: "manual" }); return { response, text: await response.text() }; };

test("the only active site resolves without domain, organization or site arguments", async () => {
  const { data, error } = await db.rpc("get_public_site");
  assert.equal(error, null);
  assert(data.id);
  assert.equal("organization_id" in data, false);
  assert.equal("organization_slug" in data, false);
  const home = await page("/");
  assert.equal(home.response.status, 200);
  assert.match(home.text, /ALBAR/);
  assert.doesNotMatch(home.text, /href="\/sitios\//);
  assert.equal((await page("/servicios")).response.status, 200);
  assert.equal((await page("/sitemap.xml")).response.status, 200);
});

test("old study URLs, unknown paths and unknown production hosts fail closed", async () => {
  for (const path of ["/sitios/albar-abogados/principal", "/sitios/estudio-local-a/principal", "/ruta-que-no-existe"]) {
    assert.equal((await page(path)).response.status, 404, path);
  }
  const status = await new Promise<number | undefined>((resolve, reject) => {
    http.get(origin + "/", { headers: { host: "unknown.example.test" } }, response => { response.resume(); response.on("end", () => resolve(response.statusCode)); }).on("error", reject);
  });
  assert.equal(status, 404);
});

test("public data exposes published snapshots and keeps administrative context private", async () => {
  const site = (await db.rpc("get_public_site")).data;
  const entries = await db.from("published_content").select("id,revision_id").eq("site_id", site.id).limit(1);
  assert.equal(entries.error, null);
  assert(entries.data?.length);
  const snapshot = await db.rpc("get_public_snapshot", { p_revision_id: entries.data[0].revision_id });
  assert.equal(snapshot.error, null);
  assert(snapshot.data.blocks.length);
  assert((await db.rpc("get_admin_context")).error);
  assert((await db.rpc("get_media_upload_context")).error);
});
