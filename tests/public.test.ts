import test from "node:test";
import http from "node:http";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
const origin = process.env.APP_URL || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (url !== "http://127.0.0.1:57321")
  throw new Error("Solo se admiten pruebas locales.");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const accounts = JSON.parse(readFileSync(".local/admin-accounts.json", "utf8"));
const f = JSON.parse(readFileSync(".local/public-fixtures.json", "utf8"));
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const anonymous = () =>
  createClient(url, key, { auth: { persistSession: false } });
function ok<T>(r: { data: T; error: unknown }): NonNullable<T> {
  assert.equal(r.error, null, JSON.stringify(r.error));
  return r.data as NonNullable<T>;
}
async function login(who: string) {
  const db = anonymous();
  assert.equal((await db.auth.signInWithPassword(accounts[who])).error, null);
  return db;
}
async function html(path: string, host?: string) {
  if (host)
    return new Promise<{ r: Response; text: string }>((resolve, reject) => {
      http
        .get(origin + path, { headers: { Host: host } }, (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (c) => chunks.push(c));
          response.on("end", () => {
            const text = Buffer.concat(chunks).toString();
            resolve({
              r: new Response(text, {
                status: response.statusCode,
                headers: response.headers as Record<string, string>,
              }),
              text,
            });
          });
        })
        .on("error", reject);
    });
  const r = await fetch(origin + path, { redirect: "manual" });
  return { r, text: await r.text() };
}
async function token(site = "A", path = "/contacto") {
  const { r, text } = await html(f[site].basePath + path);
  assert.equal(r.status, 200);
  const tokens = text.match(/[A-Za-z0-9_-]{180,}\.[A-Za-z0-9_-]{43}/g) || [];
  const value = tokens.find((t) => {
    try {
      return (
        JSON.parse(Buffer.from(t.split(".")[0], "base64url").toString())
          .siteId === f[site].siteId
      );
    } catch {
      return false;
    }
  });
  assert(value, "La página debe emitir un formulario real firmado.");
  return value;
}
const input = {
  name: "Verificación pública",
  email: "public-test@example.test",
  phone: "",
  subject: "Prueba de recepción local",
  message: "Consulta de prueba para verificar la persistencia real.",
  consent: true,
  website: "",
};
async function send(
  proof: string,
  extra: Record<string, unknown> = {},
  requestOrigin = origin,
) {
  return fetch(origin + "/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: requestOrigin },
    body: JSON.stringify({ ...input, token: proof, ...extra }),
  });
}
async function worker() {
  const r = await fetch(origin + "/api/workers/publications", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WORKER_SECRET}` },
  });
  assert.equal(r.status, 200, await r.text());
}
async function approve(db: SupabaseClient, revision: string) {
  ok(
    await db.rpc("set_revision_state", {
      p_revision_id: revision,
      p_state: "approved",
    }),
  );
}
async function publish(db: SupabaseClient, revision: string) {
  await approve(db, revision);
  ok(await db.rpc("publish_content_revision", { p_revision_id: revision }));
  await worker();
}

test("domain and explicit tenant routing, locale, SEO, sitemap and real 404 status", async () => {
  for (const site of ["A", "B"]) {
    const { r, text } = await html(f[site].basePath);
    assert.equal(r.status, 200);
    assert.match(text, new RegExp(`Estudio ${site} · demostración`));
    assert(
      !text.includes(`Estudio ${site === "A" ? "B" : "A"} · demostración`),
    );
    const map = await html(f[site].basePath + "/sitemap.xml");
    assert.equal(map.r.status, 200);
    assert.match(map.text, /<urlset/);
    assert(map.text.includes(f[site].basePath + "/articulos/primera-consulta"));
    assert(!map.text.includes(f[site === "A" ? "B" : "A"].basePath));
    const domain = await html("/", "estudio-" + site.toLowerCase() + ".test");
    assert.equal(domain.r.status, 200);
    assert.match(domain.text, new RegExp(`Estudio ${site} · demostración`));
    assert.match(
      domain.text,
      new RegExp(`https://estudio-${site.toLowerCase()}\\.test/`),
    );
  }
  for (const [path, host] of [
    [f.A.basePath + "/inexistente", undefined],
    ["/idioma/zz", undefined],
    ["/sitios/otro/principal", undefined],
    ["/", "desconocido.test"],
    [f.A.basePath, "estudio-a.test"],
  ] as const) {
    const r = await html(path, host);
    assert.equal(r.r.status, 404, `${host || "local"}${path}`);
    assert.match(r.text, /No encontramos esta página/);
  }
  const en = await html(f.A.basePath + "/idioma/en");
  assert.equal(en.r.status, 200);
  assert.match(en.text, /A clearer next step/);
  assert.match(en.text, /hrefLang="en"/);
  const robots = await html("/robots.txt");
  assert.match(robots.text, /Disallow: \//);
  for (const p of [
    "/articulos?term=malformado",
    "/articulos?page=999999999&q=ausente",
    "/autores/equipo-demo",
    "/taxonomias/category/orientacion",
  ]) {
    const r = await html(f.A.basePath + p);
    assert.equal(r.r.status, 200, p);
  }
  const page = await html(f.A.basePath + "/articulos/primera-consulta");
  assert.match(page.text, /application\/ld\+json/);
  assert.match(page.text, /"@type":"Article"/);
  assert.match(page.text, /property="og:image"/);
  assert(!page.text.includes("/cms-private/"));
});

test(
  "real public contact endpoint: origin, validation, tampering, idempotency, distributed limit and inbox isolation",
  { timeout: 120000 },
  async () => {
    // This isolated local fixture resets only ephemeral abuse counters, never received messages.
    execFileSync(
      "docker",
      [
        "exec",
        "supabase_db_leyer",
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-c",
        "truncate private.contact_rate_windows;",
      ],
      { stdio: "pipe" },
    );
    const proof = await token();
    assert.equal((await send(proof, {}, "https://otro.test")).status, 403);
    const malformed = await fetch(origin + "/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: "null",
    });
    assert.equal(malformed.status, 400);
    assert.equal((await send(proof, { consent: false })).status, 422);
    assert.equal((await send(proof, { website: "bot.test" })).status, 422);
    assert.equal((await send(proof + "x")).status, 409);
    assert.equal(
      (await send(proof, { message: "x".repeat(25000) })).status,
      400,
    );
    const accepted = await send(proof, {
      siteId: f.B.siteId,
      organizationId: f.B.organizationId,
      source_path: "/falsificado",
    });
    assert.equal(accepted.status, 201, await accepted.clone().text());
    const receipt = await accepted.json();
    const retried = await send(proof, { siteId: f.B.siteId });
    assert.equal(retried.status, 201);
    assert.equal((await retried.json()).id, receipt.id);
    assert.equal(
      (await send(proof, { subject: "Cambiar envío usado" })).status,
      422,
    );
    for (let i = 0; i < 2; i++)
      assert.equal(
        (await send(await token(), { subject: `Prueba de límite ${i}` }))
          .status,
        201,
      );
    const limited = await send(await token());
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "600");
    const other = await send(await token("B"));
    assert.equal(
      other.status,
      201,
      "El límite por estudio no bloquea al otro estudio.",
    );
    const a = await login("adminA"),
      b = await login("adminB"),
      lawyer = await login("lawyer");
    const row = ok(
      await a
        .from("contact_submissions")
        .select("*")
        .eq("id", receipt.id)
        .single(),
    );
    assert.equal(row.site_id, f.A.siteId);
    assert.equal(row.source_path, "/contacto");
    assert.equal(row.consent, true);
    assert(row.privacy_revision_id);
    assert.equal(
      ok(await b.from("contact_submissions").select("id").eq("id", receipt.id))
        ?.length,
      0,
    );
    assert.equal(
      ok(
        await lawyer
          .from("contact_submissions")
          .select("id")
          .eq("id", receipt.id),
      )?.length,
      0,
    );
    assert((await anonymous().from("contact_submissions").select("id")).error);
    ok(
      await a
        .from("contact_submissions")
        .update({
          status: "in_progress",
          internal_notes: "Verificada mediante integración",
        })
        .eq("id", receipt.id),
    );
    assert(
      (
        await a
          .from("contact_submissions")
          .update({ message: "Intento de reescritura" })
          .eq("id", receipt.id)
      ).error,
    );
  },
);

test(
  "published pointer, route redirects, scheduling, invalidation, unpublish/archive and active tenant gates",
  { timeout: 120000 },
  async () => {
    const db = await login("adminA"),
      superUser = await login("super");
    const stamp = randomUUID();
    const path = "/verificación-publica-" + stamp;
    const entry = ok(
      await db
        .from("content_entries")
        .insert({
          organization_id: f.A.organizationId,
          site_id: f.A.siteId,
          kind: "page",
          internal_name: "Verificación pública " + stamp,
        })
        .select("id")
        .single(),
    );
    const snapshot = {
      title: "Publicación inicial " + stamp,
      path,
      blocks: [
        { type: "hero", data: { heading: "Primera versión pública " + stamp } },
        {
          type: "rich_text",
          data: {
            document: {
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Texto seguro publicado",
                      marks: [{ type: "bold" }],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    };
    let rev = ok(
      await db.rpc("save_content_revision", {
        p_entry_id: entry.id,
        p_expected_revision_id: null,
        p_content: snapshot,
      }),
    );
    try {
      assert.equal((await html(f.A.basePath + path)).r.status, 404);
      await publish(db, rev);
      let page = await html(f.A.basePath + path);
      assert.equal(page.r.status, 200);
      assert(page.text.includes("Primera versión pública " + stamp));
      const pending = {
        ...snapshot,
        title: "Título pendiente " + stamp,
        blocks: [
          {
            type: "hero",
            data: { heading: "Segunda versión pública " + stamp },
          },
        ],
      };
      const second = ok(
        await db.rpc("save_content_revision", {
          p_entry_id: entry.id,
          p_expected_revision_id: rev,
          p_content: pending,
        }),
      );
      page = await html(f.A.basePath + path);
      assert(!page.text.includes(pending.title));
      assert(page.text.includes(snapshot.title));
      const conflict = await db.rpc("save_content_revision", {
        p_entry_id: entry.id,
        p_expected_revision_id: rev,
        p_content: snapshot,
      });
      assert.equal(conflict.error?.code, "40001");
      await publish(db, second);
      rev = second;
      page = await html(f.A.basePath + path);
      assert(page.text.includes(pending.title));
      const moved = ok(
        await db.rpc("save_content_revision", {
          p_entry_id: entry.id,
          p_expected_revision_id: rev,
          p_content: { ...pending, path: path + "-nueva" },
        }),
      );
      await publish(db, moved);
      rev = moved;
      const redirect = await html(f.A.basePath + path + "?referencia=1");
      assert([301, 308].includes(redirect.r.status));
      assert.equal(
        decodeURIComponent(
          new URL(redirect.r.headers.get("location")!, origin).pathname,
        ),
        f.A.basePath + path + "-nueva",
      );
      assert.equal(
        new URL(redirect.r.headers.get("location")!, origin).search,
        "?referencia=1",
      );
      for (const status of [301, 308]) {
        const from = path + "-" + status;
        ok(
          await db.rpc("manage_cms_redirect", {
            p_site_id: f.A.siteId,
            p_id: null,
            p_locale: "es-CL",
            p_from_path: from,
            p_target_entry_id: entry.id,
            p_status_code: status,
          }),
        );
        const r = await html(f.A.basePath + from);
        assert.equal(r.r.status, status);
      }
      const scheduled = ok(
        await db.rpc("save_content_revision", {
          p_entry_id: entry.id,
          p_expected_revision_id: rev,
          p_content: {
            ...pending,
            title: "Programada " + stamp,
            path: path + "-nueva",
          },
        }),
      );
      await approve(db, scheduled);
      ok(
        await db.from("scheduled_publications").insert({
          organization_id: f.A.organizationId,
          site_id: f.A.siteId,
          entry_id: entry.id,
          revision_id: scheduled,
          run_at: new Date(Date.now() + 1500).toISOString(),
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 1700));
      await worker();
      assert.equal(
        ok(
          await db
            .from("scheduled_publications")
            .select("status")
            .eq("revision_id", scheduled)
            .single(),
        ).status,
        "completed",
      );
      assert(
        (await html(f.A.basePath + path + "-nueva")).text.includes(
          "Programada " + stamp,
        ),
      );
      ok(
        await superUser
          .from("sites")
          .update({ status: "archived" })
          .eq("id", f.A.siteId),
      );
      assert.equal((await html(f.A.basePath)).r.status, 404);
      assert.equal((await html(f.B.basePath)).r.status, 200);
      ok(
        await superUser
          .from("sites")
          .update({ status: "active" })
          .eq("id", f.A.siteId),
      );
      ok(
        await superUser
          .from("organizations")
          .update({ status: "suspended" })
          .eq("id", f.A.organizationId),
      );
      assert.equal((await html(f.A.basePath + path + "-nueva")).r.status, 404);
      ok(
        await superUser
          .from("organizations")
          .update({ status: "active" })
          .eq("id", f.A.organizationId),
      );
      ok(
        await db.rpc("unpublish_content", {
          p_entry_id: entry.id,
          p_archive: false,
        }),
      );
      assert.equal((await html(f.A.basePath + path + "-nueva")).r.status, 404);
      assert.equal((await html(f.A.basePath + path)).r.status, 404);
    } finally {
      ok(
        await superUser
          .from("organizations")
          .update({ status: "active" })
          .eq("id", f.A.organizationId),
      );
      ok(
        await superUser
          .from("sites")
          .update({ status: "active" })
          .eq("id", f.A.siteId),
      );
      ok(
        await db.rpc("unpublish_content", {
          p_entry_id: entry.id,
          p_archive: true,
        }),
      );
      await worker();
    }
  },
);

test(
  "paginated public taxonomy and author queries stay scoped and expose only current publications",
  { timeout: 120000 },
  async () => {
    const db = await login("adminA");
    const ids: string[] = [];
    const stamp = randomUUID();
    try {
      for (let i = 0; i < 11; i++) {
        const entry = ok(
          await db
            .from("content_entries")
            .insert({
              organization_id: f.A.organizationId,
              site_id: f.A.siteId,
              kind: "post",
              internal_name: `Paginación ${stamp} ${i}`,
            })
            .select("id")
            .single(),
        );
        ids.push(entry.id);
        const revision = ok(
          await db.rpc("save_content_revision", {
            p_entry_id: entry.id,
            p_expected_revision_id: null,
            p_content: {
              title: `Paginación ${stamp} ${i}`,
              path: `/pagina-${stamp}-${i}`,
              authors: [f.A.authorId],
              terms: [f.A.termId],
              blocks: [],
            },
          }),
        );
        await approve(db, revision);
        ok(
          await db.rpc("publish_content_revision", { p_revision_id: revision }),
        );
      }
      const query = {
        p_site_id: f.A.siteId,
        p_locale: "es-CL",
        p_kind: "post",
        p_query: stamp,
        p_term_id: f.A.termId,
        p_author_id: f.A.authorId,
      };
      const first = ok(
        await anonymous().rpc("list_published_content", {
          ...query,
          p_page: 1,
        }),
      );
      const second = ok(
        await anonymous().rpc("list_published_content", {
          ...query,
          p_page: 2,
        }),
      );
      assert.equal(first.total, 11);
      assert.equal(first.rows.length, 9);
      assert.equal(second.rows.length, 2);
      assert(
        !first.rows.some((a: { id: string }) =>
          second.rows.some((b: { id: string }) => a.id === b.id),
        ),
      );
      const foreign = ok(
        await anonymous().rpc("list_published_content", {
          ...query,
          p_site_id: f.B.siteId,
        }),
      );
      assert.equal(foreign.total, 0);
      const listing = await html(f.A.basePath + "/articulos?q=" + stamp);
      assert.equal(listing.r.status, 200);
      assert(
        listing.text.replace(/<!--.*?-->/g, "").includes("Página 1 de 2"),
        "El listado debe mostrar la primera de dos páginas.",
      );
      assert.match(listing.text, /Siguiente/);
    } finally {
      for (const id of ids)
        ok(
          await db.rpc("unpublish_content", {
            p_entry_id: id,
            p_archive: true,
          }),
        );
      await worker();
    }
  },
);

test(
  "public changes invalidate navigation and portraits while private files never become public",
  { timeout: 120000 },
  async () => {
    const db = await login("adminA");
    const menu = ok(
      await db
        .from("menus")
        .select("id")
        .eq("site_id", f.A.siteId)
        .eq("locale", "es-CL")
        .eq("code", "primary")
        .single(),
    );
    const item = ok(
      await db
        .from("menu_items")
        .select("id,label")
        .eq("menu_id", menu.id)
        .order("position")
        .limit(1)
        .single(),
    );
    try {
      await html(f.A.basePath);
      ok(
        await db
          .from("menu_items")
          .update({ label: "Navegación actualizada verificada" })
          .eq("id", item.id),
      );
      await worker();
      assert(
        (await html(f.A.basePath)).text.includes(
          "Navegación actualizada verificada",
        ),
      );
    } finally {
      ok(
        await db
          .from("menu_items")
          .update({ label: item.label })
          .eq("id", item.id),
      );
      await worker();
    }
    const privateAsset = ok(
      await db.rpc("get_cms_media", { p_site_id: f.A.siteId }),
    ).find((m: { bucket_id: string }) => m.bucket_id === "cms-private");
    assert(privateAsset, "Se necesita la prueba de medios privados existente.");
    assert.notEqual(
      (
        await fetch(
          url +
            "/storage/v1/object/public/cms-private/" +
            privateAsset.storage_path,
        )
      ).status,
      200,
    );
    assert(
      (
        await anonymous()
          .storage.from("cms-private")
          .createSignedUrl(privateAsset.storage_path, 60)
      ).error,
    );
    assert.equal(
      ok(
        await anonymous()
          .from("media_assets")
          .select("id")
          .eq("id", privateAsset.id),
      )?.length,
      0,
    );
    assert(
      (
        await service
          .from("site_cache_events")
          .select("id")
          .is("processed_at", null)
      ).error === null,
    );
  },
);

test(
  "withdrawn sections stay retired and form locations are revoked after issuance",
  { timeout: 120000 },
  async () => {
    const db = await login("adminB");
    const contactId = f.B.entries["es-CL:/contacto"];
    const contact = ok(
      await db.rpc("get_cms_entries", { p_site_id: f.B.siteId }),
    ).find((e: { id: string }) => e.id === contactId);
    assert(contact?.published_revision_id);
    try {
      ok(
        await db.rpc("unpublish_content", {
          p_entry_id: contactId,
          p_archive: false,
        }),
      );
      await worker();
      assert.equal((await html(f.B.basePath + "/contacto")).r.status, 404);
      assert(
        !(await html(f.B.basePath + "/sitemap.xml")).text.includes(
          f.B.basePath + "/contacto<",
        ),
      );
    } finally {
      ok(
        await db.rpc("publish_content_revision", {
          p_revision_id: contact.published_revision_id,
        }),
      );
      await worker();
    }
    const proof = await token("B", "/servicios/acompanamiento-familiar");
    const site = ok(
      await db.from("sites").select("settings").eq("id", f.B.siteId).single(),
    );
    try {
      ok(
        await db
          .from("sites")
          .update({
            settings: { ...site.settings, contact_on_landings: false },
          })
          .eq("id", f.B.siteId),
      );
      assert.equal((await send(proof)).status, 403);
    } finally {
      ok(
        await db
          .from("sites")
          .update({ settings: site.settings })
          .eq("id", f.B.siteId),
      );
      await worker();
    }
  },
);
