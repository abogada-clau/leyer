import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServerClient } from "@supabase/ssr";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import type { Asset } from "../lib/admin/types";
const origin = process.env.APP_URL || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
if (!/^http:\/\/(127\.0\.0\.1|localhost):57321$/.test(url))
  throw new Error("Las pruebas solo admiten el entorno local de Leyer.");
type Account = { id: string; email: string; password: string };
async function fixtures() {
  const accounts = JSON.parse(
    await readFile(".local/admin-accounts.json", "utf8"),
  ) as Record<string, Account>;
  const data = JSON.parse(await readFile(".local/admin-fixtures.json", "utf8"));
  return {
    accounts,
    orgs: data.organizations as Record<string, { id: string; siteId: string }>,
  };
}
async function login(account: Account) {
  const jar = new Map<string, string>();
  const db = createServerClient(url, key, {
    cookies: {
      getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
      setAll: (values) => values.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  const { error } = await db.auth.signInWithPassword(account);
  assert.equal(error, null);
  return {
    db,
    cookie: () =>
      Array.from(jar, ([name, value]) => `${name}=${value}`).join("; "),
  };
}
function ok<T>(r: { data: T; error: unknown }): T {
  assert.equal(r.error, null, JSON.stringify(r.error));
  return r.data;
}
async function postMedia(
  cookie: string,
  siteId: string,
  bucket: string,
  file: File,
) {
  const form = new FormData();
  form.set("siteId", siteId);
  form.set("bucket", bucket);
  form.set("file", file);
  return fetch(
    `${origin}/api/media/${file.type === "application/pdf" ? "files" : "images"}`,
    { method: "POST", headers: { cookie, origin }, body: form },
  );
}

test(
  "roles, tenant isolation, metadata spoofing and immediate revocation",
  { timeout: 120000 },
  async () => {
    const { accounts, orgs } = await fixtures();
    const superUser = await login(accounts.super);
    const a = await login(accounts.adminA);
    const b = await login(accounts.adminB);
    const lawyer = await login(accounts.lawyer);
    const pending = await login(accounts.pending);
    const ctx = ok(await a.db.rpc("get_admin_context"));
    assert.equal(ctx.super_admin, false);
    assert.equal(ctx.sites.length, 1);
    assert.equal(ctx.sites[0].id, orgs.A.siteId);
    assert.equal(
      ok(await a.db.rpc("get_cms_listing", { p_site_id: orgs.B.siteId }))
        .length,
      0,
    );
    assert.equal(
      ok(await b.db.rpc("get_cms_listing", { p_site_id: orgs.A.siteId }))
        .length,
      0,
    );
    assert.equal(ok(await lawyer.db.rpc("get_admin_context")).sites.length, 0);
    await pending.db.auth.updateUser({
      data: { roles: ["super_admin"], role: "super_admin" },
    });
    assert.equal(
      ok(await pending.db.rpc("get_admin_context")).super_admin,
      false,
    );
    for (const [account, title] of [
      [lawyer, "Tu cuenta de abogado está activa"],
      [pending, "Acceso pendiente"],
    ] as const) {
      const page = await fetch(`${origin}/admin`, {
        headers: { cookie: account.cookie() },
      });
      assert.equal(page.status, 200);
      assert.match(await page.text(), new RegExp(title));
    }
    const membership = ok(
      await superUser.db
        .from("organization_memberships")
        .select("id")
        .eq("user_id", accounts.adminA.id)
        .eq("organization_id", orgs.A.id)
        .single(),
    );
    assert(membership);
    try {
      ok(
        await superUser.db.rpc("set_membership_access", {
          p_membership_id: membership.id,
          p_status: "suspended",
          p_roles: ["admin"],
        }),
      );
      assert.equal(ok(await a.db.rpc("get_admin_context")).sites.length, 0);
      assert.equal(
        ok(await a.db.rpc("get_cms_media", { p_site_id: orgs.A.siteId }))
          .length,
        0,
      );
      ok(
        await superUser.db.rpc("set_membership_access", {
          p_membership_id: membership.id,
          p_status: "active",
          p_roles: ["lawyer"],
        }),
      );
      assert.equal(ok(await a.db.rpc("get_admin_context")).sites.length, 0);
      ok(
        await superUser.db.rpc("set_membership_access", {
          p_membership_id: membership.id,
          p_status: "active",
          p_roles: ["admin", "lawyer"],
        }),
      );
      assert.equal(ok(await a.db.rpc("get_admin_context")).sites.length, 1);
      ok(
        await superUser.db.rpc("set_user_status", {
          p_user_id: accounts.adminA.id,
          p_status: "suspended",
        }),
      );
      assert.equal(ok(await a.db.rpc("get_admin_context")).sites.length, 0);
    } finally {
      ok(
        await superUser.db.rpc("set_user_status", {
          p_user_id: accounts.adminA.id,
          p_status: "active",
        }),
      );
      ok(
        await superUser.db.rpc("set_membership_access", {
          p_membership_id: membership.id,
          p_status: "active",
          p_roles: ["admin"],
        }),
      );
    }
  },
);

test(
  "snapshots, stale editing conflict, approval, publication and worker execution",
  { timeout: 120000 },
  async () => {
    const { accounts, orgs } = await fixtures();
    const a = await login(accounts.adminA);
    const stamp = randomUUID();
    const entry = ok(
      await a.db
        .from("content_entries")
        .insert({
          organization_id: orgs.A.id,
          site_id: orgs.A.siteId,
          internal_name: `Prueba de flujo ${stamp}`,
          kind: "page",
        })
        .select("id")
        .single(),
    );
    assert(entry);
    const content = {
      title: "Primera revisión verificada",
      path: `/prueba-${stamp}`,
      blocks: [{ type: "hero", data: { heading: "Contenido real de prueba" } }],
    };
    const v1 = ok(
      await a.db.rpc("save_cms_entry", {
        p_entry_id: entry.id,
        p_expected_revision_id: null,
        p_internal_name: "Flujo verificado",
        p_parent_id: null,
        p_content: content,
      }),
    );
    const stale = await a.db.rpc("save_cms_entry", {
      p_entry_id: entry.id,
      p_expected_revision_id: null,
      p_internal_name: "No debe guardarse",
      p_parent_id: null,
      p_content: content,
    });
    assert.equal(stale.error?.code, "40001");
    const own = ok(
      await a.db
        .rpc("get_cms_entries", { p_site_id: orgs.A.siteId })
        .eq("id", entry.id),
    );
    assert.equal(own[0].internal_name, "Flujo verificado");
    ok(
      await a.db.rpc("set_revision_state", {
        p_revision_id: v1,
        p_state: "in_review",
      }),
    );
    ok(
      await a.db.rpc("set_revision_state", {
        p_revision_id: v1,
        p_state: "approved",
      }),
    );
    ok(await a.db.rpc("publish_content_revision", { p_revision_id: v1 }));
    const immutable = await a.db.rpc("set_revision_state", {
      p_revision_id: v1,
      p_state: "draft",
    });
    assert.equal(immutable.error?.code, "23514");
    const snapshot = ok(
      await a.db.rpc("get_cms_snapshot", { p_revision_id: v1 }),
    );
    assert.equal(snapshot.blocks[0].data.heading, "Contenido real de prueba");
    const v2 = ok(
      await a.db.rpc("save_content_revision", {
        p_entry_id: entry.id,
        p_expected_revision_id: v1,
        p_content: {
          ...snapshot,
          title: "Revisión programada",
          path: `/prueba-programada-${stamp}`,
        },
      }),
    );
    ok(
      await a.db.rpc("set_revision_state", {
        p_revision_id: v2,
        p_state: "approved",
      }),
    );
    ok(
      await a.db.from("scheduled_publications").insert({
        organization_id: orgs.A.id,
        site_id: orgs.A.siteId,
        entry_id: entry.id,
        revision_id: v2,
        run_at: new Date(Date.now() + 1200).toISOString(),
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const denied = await fetch(`${origin}/api/workers/publications`, {
      method: "POST",
    });
    assert.equal(denied.status, 401);
    const run = await fetch(`${origin}/api/workers/publications`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WORKER_SECRET}` },
    });
    assert.equal(run.status, 200, await run.text());
    const jobs = ok(
      await a.db
        .from("scheduled_publications")
        .select("status")
        .eq("entry_id", entry.id),
    );
    assert.equal(jobs?.[0].status, "completed");
    const live = ok(
      await a.db
        .rpc("get_cms_entries", { p_site_id: orgs.A.siteId })
        .eq("id", entry.id),
    );
    assert.equal(live[0].published_revision_id, v2);
    // Recovering an old snapshot creates v3 and does not mutate the live pointer.
    const v3 = ok(
      await a.db.rpc("save_content_revision", {
        p_entry_id: entry.id,
        p_expected_revision_id: v2,
        p_content: snapshot,
      }),
    );
    assert.notEqual(v3, v1);
    assert.equal(
      ok(
        await a.db
          .rpc("get_cms_entries", { p_site_id: orgs.A.siteId })
          .eq("id", entry.id),
      )[0].published_revision_id,
      v2,
    );
    ok(
      await a.db.rpc("unpublish_content", {
        p_entry_id: entry.id,
        p_archive: true,
      }),
    );
  },
);

test(
  "image file, URL import, private access, PDF, immutable publication and suspended media access",
  { timeout: 120000 },
  async () => {
    const { accounts, orgs } = await fixtures();
    const a = await login(accounts.adminA);
    const b = await login(accounts.adminB);
    const superUser = await login(accounts.super);
    const png = await sharp({
      create: {
        width: 48,
        height: 32,
        channels: 4,
        background: { r: 12, g: 100, b: 65, alpha: 0.7 },
      },
    })
      .png()
      .toBuffer();
    const upload = await postMedia(
      a.cookie(),
      orgs.A.siteId,
      "cms-private",
      new File([new Uint8Array(png)], "verificacion.png", {
        type: "image/png",
      }),
    );
    assert.equal(upload.status, 201, await upload.clone().text());
    const image = await upload.json();
    const asset = ok(
      await a.db
        .rpc("get_cms_media", { p_site_id: orgs.A.siteId })
        .eq("id", image.assetId),
    )?.[0] as Asset;
    assert.equal(asset.mime_type, "image/webp");
    assert.equal(asset.width, 48);
    const denied = await fetch(
      `${origin}/api/admin/media/${asset.id}?site=${orgs.A.siteId}`,
      { headers: { cookie: b.cookie() } },
    );
    assert.equal(denied.status, 403);
    const guest = await fetch(
      `${origin}/api/admin/media/${asset.id}?site=${orgs.A.siteId}`,
    );
    assert.equal(guest.status, 401);
    const preview = await fetch(
      `${origin}/api/admin/media/${asset.id}?site=${orgs.A.siteId}`,
      { headers: { cookie: a.cookie() } },
    );
    assert.equal(preview.status, 200);
    const signed = await preview.json();
    const binary = await fetch(signed.url);
    assert.equal(binary.status, 200);
    assert.equal(
      (await sharp(Buffer.from(await binary.arrayBuffer())).metadata()).format,
      "webp",
    );
    const unsigned = await fetch(
      `${url}/storage/v1/object/public/cms-private/${asset.storage_path}`,
    );
    assert.notEqual(unsigned.status, 200);
    const pdf = await postMedia(
      a.cookie(),
      orgs.A.siteId,
      "cms-private",
      new File(
        ["%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF"],
        "verificacion.pdf",
        { type: "application/pdf" },
      ),
    );
    assert.equal(pdf.status, 201, await pdf.clone().text());
    const form = new FormData();
    form.set("siteId", orgs.A.siteId);
    form.set("bucket", "cms-public");
    form.set("url", "https://www.w3.org/Icons/w3c_home.png");
    const imported = await fetch(`${origin}/api/media/images`, {
      method: "POST",
      headers: { cookie: a.cookie(), origin },
      body: form,
    });
    assert.equal(imported.status, 201, await imported.clone().text());
    const publicImage = await imported.json();
    const entry = ok(
      await a.db
        .from("content_entries")
        .insert({
          organization_id: orgs.A.id,
          site_id: orgs.A.siteId,
          internal_name: `Imagen publicada ${randomUUID()}`,
          kind: "post",
        })
        .select("id")
        .single(),
    );
    assert(entry);
    const revision = ok(
      await a.db.rpc("save_content_revision", {
        p_entry_id: entry.id,
        p_expected_revision_id: null,
        p_content: {
          title: "Verificación de recursos publicados",
          path: `/media-${randomUUID()}`,
          cover_asset_id: publicImage.assetId,
          blocks: [],
        },
      }),
    );
    ok(
      await a.db.rpc("set_revision_state", {
        p_revision_id: revision,
        p_state: "approved",
      }),
    );
    ok(await a.db.rpc("publish_content_revision", { p_revision_id: revision }));
    const removed = await a.db.storage
      .from("cms-public")
      .remove([publicImage.storagePath]);
    const publicFile = await fetch(publicImage.src);
    assert.equal(publicFile.status, 200);
    assert(removed.error || removed.data?.length === 0);
    try {
      ok(
        await superUser.db.rpc("set_user_status", {
          p_user_id: accounts.adminA.id,
          p_status: "suspended",
        }),
      );
      const revoked = await fetch(
        `${origin}/api/admin/media/${asset.id}?site=${orgs.A.siteId}`,
        { headers: { cookie: a.cookie() } },
      );
      assert.equal(revoked.status, 403);
    } finally {
      ok(
        await superUser.db.rpc("set_user_status", {
          p_user_id: accounts.adminA.id,
          p_status: "active",
        }),
      );
    }
    ok(
      await a.db.rpc("unpublish_content", {
        p_entry_id: entry.id,
        p_archive: true,
      }),
    );
  },
);

test(
  "public design system and authentication boundary",
  { timeout: 60000 },
  async () => {
    const gallery = await fetch(`${origin}/design-system`);
    assert.equal(gallery.status, 200);
    const privatePage = await fetch(`${origin}/admin`, { redirect: "manual" });
    assert.equal(privatePage.status, 307);
    assert.match(privatePage.headers.get("location") || "", /\/auth\/login/);
  },
);
