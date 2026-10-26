import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const accounts = JSON.parse(
  readFileSync(".local/admin-accounts.json", "utf8"),
) as Record<string, { email: string; password: string }>;
async function login(page: Page, who = "admin") {
  await page.goto("/auth/login");
  await page.getByLabel("Correo electrónico").fill(accounts[who].email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill(accounts[who].password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Vista general", exact: true }),
  ).toBeVisible();
}
test("server reads, responsive navigation, catalogs and settings", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);
  for (const [route, title] of [
    ["content", "Contenidos"],
    ["media", "Biblioteca"],
    ["settings", "Configuración"],
    ["catalogs", "Autores y taxonomías"],
    ["navigation", "Navegación"],
    ["routes", "Rutas y redirecciones"],
    ["audit", "Auditoría"],
    ["profile", "Mi cuenta"],
  ]) {
    await page.goto(`/admin/${route}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }).first(),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  await expect(page.getByLabel("Estudio", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Sitio", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Estudios y usuarios", exact: true })).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(391);
  await page.getByRole("link", { name: "Contenidos", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Contenidos", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Vista general", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(821);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Vista general", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/dashboard-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("editor: save, block composition, preview, approval, publication and restoration", async ({
  page,
  context,
}) => {
  await login(page);
  await page.goto("/admin/content/new");
  await page.getByLabel("Nombre interno").fill(`Navegador ${Date.now()}`);
  await page.getByLabel("Tipo *", { exact: true }).selectOption("landing");
  await page.getByRole("button", { name: "Crear y abrir editor" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/[a-f0-9-]+$/);
  await page
    .getByLabel("Título", { exact: true })
    .fill("Una landing verificada en navegador");
  await page
    .getByLabel("Ruta", { exact: true })
    .fill(`/navegador-${Date.now()}`);
  await page
    .getByRole("button", { name: "Agregar bloque", exact: true })
    .click();
  await page
    .getByLabel("Encabezado", { exact: true })
    .fill("Claridad para tu estudio");
  await page
    .getByLabel("Texto", { exact: true })
    .fill("Texto estructurado guardado en una revisión real.");
  await page.getByLabel("Tipo de bloque a agregar").selectOption("rich_text");
  await page
    .getByRole("button", { name: "Agregar bloque", exact: true })
    .click();
  const rich = page.getByRole("textbox", {
    name: "Texto enriquecido",
    exact: true,
  });
  await rich.fill("Texto con formato conservado");
  await rich.press("ControlOrMeta+A");
  await page.getByRole("button", { name: "Negrita", exact: true }).click();
  await expect(rich.locator("strong")).toHaveText(
    "Texto con formato conservado",
  );
  await page
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  const previewPromise = context.waitForEvent("page");
  await page.getByRole("link", { name: "Previsualizar guardado" }).click();
  const preview = await previewPromise;
  await expect(
    preview.getByRole("heading", {
      name: "Una landing verificada en navegador",
    }),
  ).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Claridad para tu estudio" }),
  ).toBeVisible();
  await expect(
    preview
      .locator("strong")
      .filter({ hasText: "Texto con formato conservado" }),
  ).toBeVisible();
  await preview.close();
  await page
    .getByRole("button", { name: "Enviar a revisión", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Enviar a revisión", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Aprobar revisión", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Aprobar revisión", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Publicar revisión", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Despublicar", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Título", { exact: true }).fill("Segunda revisión");
  await page
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Recuperar", exact: true })
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "Una landing verificada en navegador",
  );
  await page
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Despublicar", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Despublicar", exact: true }),
  ).not.toBeVisible();
});
test("two editors preserve a stale local draft and expose comparison recovery", async ({
  browser,
}) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const a = await contextA.newPage();
  const b = await contextB.newPage();
  await login(a);
  await login(b);
  await a.goto("/admin/content/new");
  await a
    .getByLabel("Nombre interno")
    .fill(`Conflicto navegador ${Date.now()}`);
  await a.getByRole("button", { name: "Crear y abrir editor" }).click();
  await expect(a).toHaveURL(/\/content\/[a-f0-9-]+$/);
  const route = a.url();
  await a.getByLabel("Título", { exact: true }).fill("Base compartida");
  await a.getByLabel("Ruta", { exact: true }).fill(`/conflicto-${Date.now()}`);
  await a
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    a.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  await b.goto(route);
  await expect(b.getByLabel("Título", { exact: true })).toHaveValue(
    "Base compartida",
  );
  await b
    .getByLabel("Título", { exact: true })
    .fill("Trabajo del segundo editor");
  await a
    .getByLabel("Título", { exact: true })
    .fill("Cambio del primer editor");
  await a
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    a.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  await b
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    b.getByRole("alert").filter({ hasText: "Conflicto de edición" }),
  ).toBeVisible();
  await expect(b.getByLabel("Título", { exact: true })).toHaveValue(
    "Trabajo del segundo editor",
  );
  await b
    .getByRole("button", { name: "Comparar con la revisión actual" })
    .click();
  await expect(b.getByRole("dialog")).toContainText("Cambio del primer editor");
  await b
    .getByRole("dialog")
    .getByRole("button", { name: "Continuar editando mi copia tras comparar" })
    .click();
  await b
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    b.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  await contextA.close();
  await contextB.close();
});
test("account without administrative access stays restricted", async ({
  browser,
}) => {
  for (const [who, title] of [
    ["pending", "Acceso pendiente"],
  ]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/auth/login");
    await page.getByLabel("Correo electrónico").fill(accounts[who].email);
    await page
      .getByLabel("Contraseña", { exact: true })
      .fill(accounts[who].password);
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Contenidos", exact: true }),
    ).toHaveCount(0);
    await context.close();
  }
});
test("library UI: optimized upload, metadata, public copy and theme", async ({
  page,
}) => {
  await login(page);
  await page.goto("/admin/media");
  await page.getByRole("button", { name: "Cargar imagen o PDF" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const sharp = (await import("sharp")).default;
  const buffer = await sharp({
    create: {
      width: 96,
      height: 64,
      channels: 4,
      background: { r: 30, g: 80, b: 60, alpha: 0.8 },
    },
  })
    .png()
    .toBuffer();
  const filename = `biblioteca-ui-${Date.now()}`;
  await dialog
    .getByLabel("Seleccionar imagen")
    .setInputFiles({ name: `${filename}.png`, mimeType: "image/png", buffer });
  await expect(
    dialog.getByText("Imagen guardada", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.getByLabel("Buscar", { exact: true }).fill(filename);
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await page
    .getByRole("button", { name: "Ver detalles", exact: true })
    .first()
    .click();
  const details = page.getByRole("dialog");
  await expect(
    details.getByText(
      "Privado · los enlaces se renuevan automáticamente cada 45 segundos.",
    ),
  ).toBeVisible();
  await details
    .getByLabel("Texto alternativo", { exact: true })
    .fill("Imagen verificada desde el panel");
  await details.getByLabel("Créditos", { exact: true }).fill("Estudio local");
  await details.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(details).not.toBeVisible();
  await page
    .getByRole("button", { name: "Ver detalles", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Crear copia pública" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar copia pública" })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Copia pública creada" }),
  ).toBeVisible();
  await page.goto("/admin/content/new");
  await page
    .getByLabel("Nombre interno")
    .fill(`Selección de biblioteca ${Date.now()}`);
  await page.getByRole("button", { name: "Crear y abrir editor" }).click();
  await expect(page).toHaveURL(/\/content\/[a-f0-9-]+$/);
  await page
    .getByRole("button", { name: "Seleccionar recurso", exact: true })
    .click();
  await page.getByRole("dialog").getByLabel("Buscar recurso").fill(filename);
  await page
    .getByRole("dialog")
    .getByRole("button", {
      name: new RegExp(`Seleccionar ${filename}.*público`),
    })
    .click();
  await expect(page.getByText(/^Recurso: /)).toBeVisible();
  await page
    .getByLabel("Título", { exact: true })
    .fill("Contenido con recurso seleccionado");
  await page
    .getByLabel("Ruta", { exact: true })
    .fill(`/seleccion-${Date.now()}`);
  await page
    .getByRole("button", { name: "Guardar revisión", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Nueva revisión guardada." }),
  ).toBeVisible();
  await page.goto("/admin/media");
  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await page
    .getByRole("menuitemradio", { name: "Oscuro", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({ path: ".local/library-dark.png", fullPage: true });
});
test("Auth invitation callback establishes the session and permits choosing a password", async ({
  page,
}) => {
  process.loadEnvFile(".env.local");
  const { createClient } = await import("@supabase/supabase-js");
  const { randomBytes } = await import("node:crypto");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (url !== "http://127.0.0.1:57321")
    throw new Error("Solo se permiten pruebas locales.");
  const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const email = `invite-${Date.now()}@leyer.local`;
  const invitation = await db.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: "http://localhost:3000/auth/update-password" },
  });
  if (invitation.error)
    throw new Error("No se pudo preparar la invitación local.");
  await page.goto(invitation.data.properties.action_link);
  await expect(page).toHaveURL(/\/auth\/update-password/);
  const password = randomBytes(24).toString("base64url");
  await page.getByLabel("Nueva contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Guardar contraseña", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Acceso pendiente", exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
});
