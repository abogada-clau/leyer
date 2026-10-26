import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createClient } from "@supabase/supabase-js";
import { ContentBlocks } from "../components/public/content-blocks";
import { materializeServiceContent } from "../lib/content/service-template";
import { validateSnapshot } from "../lib/admin/validation";
import type { Block, Snapshot } from "../lib/admin/types";

const block = (type: string, data: Block["data"], variant = "default"): Block => ({ key: randomUUID(), type, data, variant, schema_version: 1, assets: [] });
const snapshot = (blocks: Block[]): Snapshot => ({ title: "Servicio administrable", excerpt: "", path: `/cms-servicio-${randomUUID()}`, template_key: "service-landing", template_version: 2, cover_asset_id: null, seo: {}, blocks, authors: [], terms: [], relations: [] });
const render = (blocks: Block[]) => renderToStaticMarkup(createElement(ContentBlocks, { blocks, serviceLayout: true, firstHeroAsTitle: true, link: href => typeof href === "string" && !href.startsWith("javascript:") ? href : null, image: (id, alt) => createElement("img", { src: `/test/${id}.webp`, alt }) }));

test("empty and removed service elements have no generated copy, media or benefits", () => {
  const html = render([block("hero", { heading: "Título propio", visual: "none", note: "", eyebrow: "" })]);
  assert.match(html, /Título propio/);
  assert.doesNotMatch(html, /service-benefit|Asesoría y representación|primer paso|WhatsApp|service-brand-visual|service-paper/);
  assert.doesNotMatch(html, /<img/);
  const hero = block("hero", { heading: "Título propio", visual: "brand" });
  hero.assets = [{ asset_id: randomUUID(), slot: "image", alt_text: "Foto anterior" }];
  const illustration = render([hero]);
  assert.match(illustration, /service-brand-visual/);
  assert.doesNotMatch(illustration, /<img/);
});

test("revision content controls benefits, icons, images, notes, actions, visibility and ordering", () => {
  const benefits = block("card_grid", { aria_label: "Ventajas editadas", tone: "sand", columns: "2", items: [{ heading: "Ventaja propia", body: "Descripción propia", icon: "house", asset_slot: "item-photo" }] }, "benefits");
  benefits.assets = [{ asset_id: randomUUID(), slot: "item-photo", alt_text: "Foto de una ventaja", focal_point: { x: .2, y: .7 } }];
  const blocks = [block("cta", { heading: "Cierre al inicio", actions: [{ label: "Otro WhatsApp", href: "https://wa.me/56911111111", icon: "message-circle", style: "text" }] }), benefits, block("hero", { heading: "Portada elegida", note: "Nota propia", note_icon: "coins", visual: "requirements" }), block("split_content", { heading: "Oculto", body: "Texto oculto", hidden: true })];
  const html = render(blocks);
  assert(html.indexOf("Cierre al inicio") < html.indexOf("Ventaja propia"));
  for (const text of ["Ventajas editadas", "Descripción propia", "Foto de una ventaja", "Nota propia", 'data-tone="sand"', 'data-columns="2"', 'data-action-style="text"', "lucide-house", "service-requirements-visual"]) assert(html.includes(text), text);
  assert.doesNotMatch(html, /Texto oculto|Tu situación primero|Demos el siguiente paso/);
  assert.equal((html.match(/<img/g) || []).length, 1);
  validateSnapshot(snapshot(blocks));
});

test("legacy materialization preserves copy and assets, then never restores deleted v2 content", () => {
  const legacy = { ...snapshot([block("hero", { heading: "Hook anterior", eyebrow: "Servicio administrable", body: "Explicación anterior" }), block("split_content", { heading: "Introducción propia", body: "Texto anterior" })]), template_version: 1 };
  const migrated = materializeServiceContent(legacy, { contactPath: "/contacto", whatsappHref: "https://wa.me/56911111111", heroAsset: { asset_id: randomUUID(), slot: "image", alt_text: "Foto" } });
  assert.equal(migrated.template_version, 2);
  assert.equal(migrated.blocks[0].data.lead, "Hook anterior");
  assert.equal(migrated.blocks[0].assets.length, 1);
  assert.equal(legacy.blocks[0].data.heading, "Hook anterior");
  migrated.blocks = migrated.blocks.filter(b => b.variant !== "benefits" && b.type !== "cta");
  assert.deepEqual(materializeServiceContent(migrated), migrated);
  validateSnapshot(migrated);
});

test("presentation validation rejects executable/unknown options and invalid focal points", () => {
  const invalidCases: Block["data"][] = [{ heading: "H", visual: "<script>" }, { heading: "H", tone: "red;display:none" }, { heading: "H", note_icon: "constructor" }, { heading: "H", hidden: "false" }, { heading: "H", columns: 4 }, { heading: "H", actions: [{ label: "Botón", href: "javascript:alert(1)" }] }];
  for (const data of invalidCases) assert.throws(() => validateSnapshot(snapshot([block("hero", data)])));
  const image = block("hero", { heading: "H", visual: "image" });
  image.assets = [{ asset_id: randomUUID(), slot: "image", alt_text: "", focal_point: { x: 2, y: .5 } }];
  assert.throws(() => validateSnapshot(snapshot([image])));
});

test("real database preserves presentation in revisions and publishing, rejects invalid options and missing media", { skip: !process.env.NEXT_PUBLIC_SUPABASE_URL }, async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):57321$/);
  const fixtures = JSON.parse(await readFile(".local/albar-fixtures.json", "utf8"));
  const accounts = JSON.parse(await readFile(".local/admin-accounts.json", "utf8"));
  const db = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const login = await db.auth.signInWithPassword(accounts.admin); assert.equal(login.error, null);
  const entry = await db.from("content_entries").insert({ site_id: fixtures.siteId, internal_name: "Verificación CMS dinámico", kind: "landing", locale: "es-CL" }).select("id").single();
  assert.equal(entry.error, null); const entryId = entry.data!.id;
  const content = snapshot([block("hero", { heading: "Portada desde BD", lead: "Bajada desde BD", note: "Nota desde BD", note_icon: "message-circle", visual: "brand", actions: [] }), block("card_grid", { tone: "sand", columns: "2", items: [{ heading: "Beneficio desde BD", body: "Texto desde BD", icon: "house" }] }, "benefits")]);
  let expected: string | null = null;
  try {
    const saved = await db.rpc("save_content_revision", { p_entry_id: entryId, p_expected_revision_id: expected, p_content: content });
    assert.equal(saved.error, null); expected = saved.data;
    const stored = await db.rpc("get_cms_snapshot", { p_revision_id: expected }); assert.equal(stored.error, null);
    assert.deepEqual(stored.data.blocks.map((b: Block) => b.data), content.blocks.map(b => b.data));
    assert.equal((await db.rpc("set_revision_state", { p_revision_id: expected, p_state: "approved" })).error, null);
    assert.equal((await db.rpc("publish_content_revision", { p_revision_id: expected })).error, null);
    const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
    const publicSnapshot = await anon.rpc("get_public_snapshot", { p_revision_id: expected });
    assert.equal(publicSnapshot.data.template_version, 2);
    assert.equal(publicSnapshot.data.blocks[1].data.items[0].heading, "Beneficio desde BD");
    const draft = structuredClone(content); draft.blocks = [block("hero", { heading: "Solo borrador", visual: "none" })];
    const newRevision = await db.rpc("save_content_revision", { p_entry_id: entryId, p_expected_revision_id: expected, p_content: draft }); assert.equal(newRevision.error, null);
    const originalPublic = await anon.rpc("get_public_snapshot", { p_revision_id: expected }); assert.equal(originalPublic.data.blocks[0].data.heading, "Portada desde BD");
    expected = newRevision.data;
    const rejectedData: Block["data"][] = [{ heading: "Inválido", visual: "inject" }, { heading: "Inválido", actions: [{ label: "Malo", href: "/contacto", icon: "constructor" }] }];
    for (const data of rejectedData) {
      const invalid = snapshot([block("hero", data)]);
      const rejected = await db.rpc("save_content_revision", { p_entry_id: entryId, p_expected_revision_id: expected, p_content: invalid });
      assert.equal(rejected.error?.code, "23514");
    }
    const invalidMedia = snapshot([block("hero", { heading: "Imagen inexistente" })]);
    invalidMedia.blocks[0].assets = [{ asset_id: randomUUID(), slot: "image", alt_text: "No existe" }];
    assert((await db.rpc("save_content_revision", { p_entry_id: entryId, p_expected_revision_id: expected, p_content: invalidMedia })).error);

  } finally {
    await db.rpc("unpublish_content", { p_entry_id: entryId, p_archive: true });
    await db.auth.signOut();
  }
});
