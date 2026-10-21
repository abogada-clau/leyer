import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!/^http:\/\/(127\.0\.0\.1|localhost):57321$/.test(url))
    throw new Error(
      "Este comando solo admite Supabase local de Leyer en el puerto 57321.",
    );
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  function check<T>(r: { data: T; error: { message: string } | null }): T {
    if (r.error) throw new Error(r.error.message);
    return r.data;
  }
  await mkdir(".local", { recursive: true });
  type Account = { id: string; email: string; password: string };
  let saved: Record<string, Account> = {};
  try {
    saved = JSON.parse(await readFile(".local/admin-accounts.json", "utf8"));
  } catch {}
  const accounts: Record<string, Account> = {};
  for (const [key, name] of [
    ["super", "Superadministrador local"],
    ["adminA", "Administrador local A"],
    ["adminB", "Administrador local B"],
    ["lawyer", "Abogado local"],
    ["pending", "Cuenta sin roles"],
  ] as const) {
    const email = saved[key]?.email || `${key.toLowerCase()}@leyer.local`;
    const password =
      saved[key]?.password || randomBytes(24).toString("base64url");
    if (saved[key]) {
      const found = await admin.auth.admin.getUserById(saved[key].id);
      if (found.data.user) {
        accounts[key] = saved[key];
        continue;
      }
    }
    const response = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (response.error) throw response.error;
    const data = response.data;
    if (!data.user) throw new Error("No se creó la cuenta.");
    accounts[key] = { id: data.user.id, email, password };
  }
  await writeFile(
    ".local/admin-accounts.json",
    JSON.stringify(accounts, null, 2),
    { mode: 0o600 },
  );
  const global = check(
    await admin
      .from("platform_role_assignments")
      .select("user_id")
      .eq("role_code", "super_admin"),
  );
  if (!global?.length)
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
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        `select private.bootstrap_super_admin('${accounts.super.id}'::uuid);`,
      ],
      { stdio: "pipe" },
    );
  const superSession = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const login = await superSession.auth.signInWithPassword(accounts.super);
  if (login.error) throw login.error;
  const organizations: Record<string, { id: string; siteId: string }> = {};
  for (const key of ["A", "B"]) {
    const slug = `estudio-local-${key.toLowerCase()}`;
    let org = check(
      await superSession
        .from("organizations")
        .select("id")
        .eq("slug", slug)
        .maybeSingle(),
    );
    if (!org)
      org = check(
        await superSession
          .from("organizations")
          .insert({ name: `Estudio local ${key}`, slug })
          .select("id")
          .single(),
      );
    if (!org) throw new Error("No se creó el estudio.");
    let site = check(
      await superSession
        .from("sites")
        .select("id")
        .eq("organization_id", org.id)
        .eq("slug", "principal")
        .maybeSingle(),
    );
    if (!site)
      site = check(
        await superSession
          .from("sites")
          .insert({
            organization_id: org.id,
            name: `Sitio local ${key}`,
            slug: "principal",
            status: "active",
            settings: {
              public_name: `Estudio local ${key}`,
              description: "Entorno local de verificación de Leyer.",
            },
          })
          .select("id")
          .single(),
      );
    if (!site) throw new Error("No se creó el sitio.");
    organizations[key] = { id: org.id, siteId: site.id };
    const who = accounts[key === "A" ? "adminA" : "adminB"];
    const membership = check(
      await superSession
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", org.id)
        .eq("user_id", who.id)
        .maybeSingle(),
    );
    if (!membership)
      check(
        await superSession.rpc("create_membership_access", {
          p_organization_id: org.id,
          p_user_id: who.id,
          p_status: "active",
          p_roles: ["admin"],
        }),
      );
    const entries = check(
      await superSession.rpc("get_cms_entries", { p_site_id: site.id }),
    );
    if (!entries?.length) {
      const entry = check(
        await superSession
          .from("content_entries")
          .insert({
            organization_id: org.id,
            site_id: site.id,
            internal_name: `Presentación del estudio ${key}`,
            kind: "page",
          })
          .select("id")
          .single(),
      );
      const revision = check(
        await superSession.rpc("save_content_revision", {
          p_entry_id: entry!.id,
          p_expected_revision_id: null,
          p_content: {
            title: `Bienvenidos al estudio local ${key}`,
            excerpt:
              "Contenido guardado en Supabase local para verificar el panel.",
            path: "/",
            blocks: [
              {
                type: "hero",
                data: {
                  heading: "Claridad en cada paso",
                  body: "Este contenido pertenece a un estudio independiente.",
                },
              },
            ],
          },
        }),
      );
      check(
        await superSession.rpc("set_revision_state", {
          p_revision_id: revision,
          p_state: "approved",
        }),
      );
      check(
        await superSession.rpc("publish_content_revision", {
          p_revision_id: revision,
        }),
      );
    }
  }
  for (const [key, roles] of [
    ["lawyer", ["lawyer"]],
    ["pending", []],
  ] as const) {
    const org = organizations.A.id;
    const membership = check(
      await superSession
        .from("organization_memberships")
        .select("id")
        .eq("organization_id", org)
        .eq("user_id", accounts[key].id)
        .maybeSingle(),
    );
    if (!membership)
      check(
        await superSession.rpc("create_membership_access", {
          p_organization_id: org,
          p_user_id: accounts[key].id,
          p_status: "active",
          p_roles: roles,
        }),
      );
  }
  await writeFile(
    ".local/admin-fixtures.json",
    JSON.stringify({ organizations }, null, 2),
    { mode: 0o600 },
  );
  console.log(
    "Entorno local preparado: cinco cuentas, dos estudios independientes y contenidos persistidos. Credenciales en .local/admin-accounts.json (archivo privado, fuera de Git).",
  );
}
main().catch((e) => {
  console.error(
    e instanceof Error ? e.message : "No se pudo completar el comando.",
  );
  process.exitCode = 1;
});
