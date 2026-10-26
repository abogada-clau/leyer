import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!/^http:\/\/(127\.0\.0\.1|localhost):57321$/.test(url))
    throw new Error("Este comando solo admite Supabase local de Leyer en el puerto 57321.");
  const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  type Account = { id: string; email: string; password: string };
  await mkdir(".local", { recursive: true });
  let saved: Record<string, Account> = {};
  try { saved = JSON.parse(await readFile(".local/admin-accounts.json", "utf8")); } catch {}
  const accounts: Record<string, Account> = {};
  for (const [key, name] of [["admin", "Administración local"], ["pending", "Cuenta sin acceso"]]) {
    const previous = saved[key] || (key === "admin" ? saved.super : undefined);
    if (previous && (await db.auth.admin.getUserById(previous.id)).data.user) accounts[key] = previous;
    else {
      const email = previous?.email || `${key}@leyer.local`;
      const password = previous?.password || randomBytes(24).toString("base64url");
      const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: name } });
      if (error || !data.user) throw error || new Error("No se creó la cuenta.");
      accounts[key] = { id: data.user.id, email, password };
    }
    const { error } = await db.from("profiles").update({ status: "active", is_admin: key === "admin" }).eq("id", accounts[key].id);
    if (error) throw error;
  }
  await writeFile(".local/admin-accounts.json", JSON.stringify(accounts, null, 2), { mode: 0o600 });
  const { data: site, error } = await db.from("sites").select("id").single();
  if (error || !site) throw error || new Error("Ejecuta las migraciones para preparar el sitio.");
  await writeFile(".local/admin-fixtures.json", JSON.stringify({ siteId: site.id }, null, 2), { mode: 0o600 });
  console.log("Sitio único preparado. Credenciales de verificación en .local/admin-accounts.json.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
