import { createServerClient } from "@supabase/ssr";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const origin = process.env.APP_URL || "http://localhost:3000";
  if (url !== "http://127.0.0.1:57321" || !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
    throw new Error("Este comando solo admite Supabase y aplicación locales.");
  const accounts = JSON.parse(await readFile(".local/admin-accounts.json", "utf8"));
  const sql = await readFile("supabase/seeds/albar/seed.sql", "utf8");
  const publish = process.argv.includes("--publish-demo");
  const config: Record<string, unknown> = {
    actor_email: accounts.super.email, domain: "albar.test", demo: true,
    publish, activate_site: publish, legal_review_confirmed: publish,
    privacy_review_confirmed: publish,
    privacy_controller: "Responsable de verificación local ALBAR (datos de demostración)",
    privacy_processors: "Supabase local y aplicación local de verificación",
    retention_days: 90, contact_enabled: publish,
  };
  const jar = new Map<string, string>();
  const db = createServerClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: { getAll: () => Array.from(jar, ([name, value]) => ({ name, value })), setAll: values => values.forEach(c => jar.set(c.name, c.value)) },
  });
  const login = await db.auth.signInWithPassword(accounts.super);
  if (login.error) throw login.error;
  function seed(extra: Record<string, unknown> = {}) {
    const value = JSON.stringify({ ...config, ...extra });
    if (value.includes("$LOCAL_ALBAR$")) throw new Error("Delimitador de configuración inválido.");
    execFileSync("docker", ["exec", "-i", "supabase_db_leyer", "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], {
      input: `do $cfg$ begin perform set_config('leyer.albar_config',$LOCAL_ALBAR$${value}$LOCAL_ALBAR$,false);end;$cfg$;\n${sql}`,
      stdio: ["pipe", "pipe", "pipe"],
    });
  }
  let org = await db.from("organizations").select("id").eq("slug", "albar-abogados").maybeSingle();
  if (org.error) throw org.error;
  if (!org.data) {
    seed({ publish: false, activate_site: false });
    org = await db.from("organizations").select("id").eq("slug", "albar-abogados").single();
  }
  const site = await db.from("sites").select("id").eq("organization_id", org.data!.id).eq("slug", "principal").single();
  if (site.error) throw site.error;
  const media = await db.rpc("get_cms_media", { p_site_id: site.data.id });
  if (media.error) throw media.error;
  const sources: { key: string; filename: string; alt: string }[] = JSON.parse(await readFile("supabase/seeds/albar/assets/manifest.json", "utf8"));
  const assets: Record<string, string> = {};
  for (const source of sources) {
    const existing = media.data.find((m: { filename: string; bucket_id: string }) => m.filename === source.filename && m.bucket_id === "cms-public");
    if (existing) { assets[source.key] = existing.id; continue; }
    const form = new FormData();
    form.set("siteId", site.data.id); form.set("bucket", "cms-public"); form.set("alt", source.alt);
    const bytes = await readFile(`supabase/seeds/albar/assets/${source.filename}`);
    form.set("file", new File([new Uint8Array(bytes)], source.filename, { type: "image/webp" }));
    const response = await fetch(origin + "/api/media/images", {
      method: "POST", headers: { origin, cookie: Array.from(jar, ([name, value]) => `${name}=${value}`).join("; ") }, body: form,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo cargar la imagen.");
    assets[source.key] = result.assetId;
  }
  seed({ assets });
  const fixtures = { organizationId: org.data!.id, siteId: site.data.id, assets, published: publish, basePath: "/sitios/albar-abogados/principal" };
  await writeFile(".local/albar-fixtures.json", JSON.stringify(fixtures, null, 2));
  console.log(`ALBAR local: ${origin}${fixtures.basePath} · ${publish ? "demostración publicada" : "contenido en revisión"}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
