import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const fixtures = JSON.parse(
  readFileSync(".local/public-fixtures.json", "utf8"),
);
const accounts = JSON.parse(readFileSync(".local/admin-accounts.json", "utf8"));
const base = fixtures.A.basePath;
async function login(page: Page, who = "adminA") {
  await page.goto("/auth/login");
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill(accounts[who].email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill(accounts[who].password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function loadedImages(page: Page) {
  for (const image of await page.locator(".public-site img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
      )
      .toBeTruthy();
  }
  await page.locator(".public-wordmark").scrollIntoViewIfNeeded();
}
async function noOverflow(page: Page, width: number) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width + 1);
}
test("all CMS blocks, public navigation, listings, safe images and languages", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const rendered = new Set<string>();
  for (const path of [
    "",
    "/servicios/acompanamiento-familiar",
    "/articulos/primera-consulta",
  ]) {
    const r = await page.goto(base + path);
    expect(r?.status()).toBe(200);
    await expect(page.locator("main h1")).toHaveCount(1);
    for (const type of await page
      .locator("[data-block]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-block")!)))
      rendered.add(type);
    for (const image of await page.locator(".public-site img").all()) {
      await expect(image).toHaveAttribute("alt");
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (n: HTMLImageElement) => n.complete && n.naturalWidth > 0,
          ),
        )
        .toBeTruthy();
      expect(await image.getAttribute("src")).not.toContain("cms-private");
    }
  }
  expect([...rendered].sort()).toEqual(
    [
      "hero",
      "split_content",
      "card_grid",
      "checklist",
      "steps",
      "faq",
      "cta",
      "rich_text",
      "image",
      "quote",
      "related_content",
    ].sort(),
  );
  await page.goto(base + "/servicios/acompanamiento-familiar");
  await expect(
    page.getByRole("button", { name: "Cambiar tema" }),
  ).toBeVisible();
  const faq = page.locator('[data-block="faq"] summary').first();
  await faq.press("Enter");
  await expect(
    page.locator('[data-block="faq"] details').first(),
  ).toHaveAttribute("open", "");
  await page.goto(base);
  await page
    .getByRole("navigation", { name: "Navegación principal", exact: true })
    .getByRole("link", { name: "Servicios", exact: true })
    .click();
  await expect(page).toHaveURL(base + "/servicios");
  expect(
    await page.locator(".public-entry-card").count(),
  ).toBeGreaterThanOrEqual(2);
  await page
    .getByRole("navigation", { name: "Navegación principal", exact: true })
    .getByRole("link", { name: "Artículos", exact: true })
    .click();
  await page.getByLabel("Buscar artículos").fill("primera");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.locator(".public-entry-card")).toHaveCount(1);
  await page.goto(base + "/equipo");
  await page
    .getByRole("link", { name: "Equipo de demostración A", exact: true })
    .click();
  await expect(page).toHaveURL(base + "/autores/equipo-demo");
  await expect(
    page.getByRole("heading", {
      name: "Equipo de demostración A",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(base + "/taxonomias/category/orientacion");
  await expect(page.locator(".public-entry-card")).toHaveCount(2);
  await page.goto(base);
  await page
    .getByRole("navigation", { name: "Idioma", exact: true })
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "A clearer next step." }),
  ).toBeVisible();
  await page.goto(fixtures.B.basePath);
  await expect(page.locator(".public-wordmark")).toContainText("Estudio B");
  await expect(page.locator("body")).not.toContainText(
    "Equipo de demostración A",
  );
  expect(errors).toEqual([]);
});

test("desktop, tablet, mobile, keyboard and light/dark themes", async ({
  page,
}) => {
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base);
    await expect(page.locator("main h1")).toBeVisible();
    await noOverflow(page, width);
    await loadedImages(page);
    await page.screenshot({
      path: `.local/public-home-${width}.png`,
      fullPage: true,
    });
    if (width === 1440)
      await page.screenshot({ path: ".local/public-home-desktop.png" });
    if (width <= 820) {
      const menu = page.getByLabel("Abrir menú de navegación");
      await menu.focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("navigation", { name: "Navegación móvil", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("navigation", { name: "Navegación móvil", exact: true })
        .getByRole("link", { name: "Equipo", exact: true })
        .click();
      await expect(page).toHaveURL(base + "/equipo");
      await expect(
        page.getByRole("navigation", { name: "Navegación móvil", exact: true }),
      ).not.toBeVisible();
    }
    if (width === 390) {
      await page.goto(base);
      await expect(
        page.getByRole("button", { name: "Cambiar tema" }),
      ).toBeVisible();
      await page.getByLabel("Abrir menú de navegación").press("Enter");
      await page
        .locator(".public-mobile-languages")
        .getByRole("link", { name: "EN", exact: true })
        .click();
      await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
    }
    await page.goto(base + "/contacto");
    await noOverflow(page, width);
    await expect(
      page.getByRole("button", { name: "Enviar consulta", exact: true }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.getByRole("link", { name: "Saltar al contenido" }).focus();
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await page
    .getByRole("menuitemradio", { name: "Oscuro", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await loadedImages(page);
  await page.screenshot({
    path: ".local/public-home-dark.png",
    fullPage: true,
  });
  await page.goto(base + "/servicios/acompanamiento-familiar");
  await noOverflow(page, 1440);
  await loadedImages(page);
  await page.screenshot({
    path: ".local/public-landing-dark.png",
    fullPage: true,
  });
  await page.goto(base + "/no-existe");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await page.goto(base + "/servicios/acompanamiento-familiar");
  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await page.getByRole("menuitemradio", { name: "Claro", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  const missing = await page.goto(base + "/no-existe");
  expect(missing?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "No encontramos esta página." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Volver al inicio" }).click();
  await expect(page).toHaveURL(base);
});

test("real contact, client validation, recovery, private inbox and focus restoration", async ({
  page,
  browser,
}) => {
  process.loadEnvFile(".env.local");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:57321")
    throw new Error("Solo se permiten pruebas locales.");
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
  await page.goto(base + "/contacto");
  await page
    .getByRole("button", { name: "Enviar consulta", exact: true })
    .click();
  await expect(page.getByLabel("Tu nombre", { exact: true })).toBeFocused();
  await expect(
    page.getByText("Escribe tu nombre.", { exact: true }),
  ).toBeVisible();
  const subject = "Navegador público " + Date.now();
  await page
    .getByLabel("Tu nombre", { exact: true })
    .fill("Persona de prueba navegador");
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill("browser-public@example.test");
  await page.getByLabel("Motivo de la consulta", { exact: true }).fill(subject);
  await page
    .getByLabel("¿En qué podemos ayudarte?", { exact: true })
    .fill("Mensaje de prueba para verificar la bandeja privada del estudio.");
  await page
    .getByRole("button", { name: "Enviar consulta", exact: true })
    .click();
  await expect(
    page.getByText(
      "Debes aceptar el tratamiento descrito en la política de privacidad.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("checkbox").check();
  // A transient network error must retain the user's text and permit a real retry.
  await page.route("**/api/contact", (route) => route.abort("failed"), {
    times: 1,
  });
  await page
    .getByRole("button", { name: "Enviar consulta", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Tu texto sigue aquí" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Motivo de la consulta", { exact: true }),
  ).toHaveValue(subject);
  await page
    .getByRole("button", { name: "Enviar consulta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Consulta recibida", exact: true }),
  ).toBeVisible();
  const ctx = await browser.newContext();
  const admin = await ctx.newPage();
  await login(admin);
  await admin.goto("/admin/contacts?q=" + encodeURIComponent(subject));
  await expect(
    admin.getByRole("heading", { name: "Consultas", exact: true }),
  ).toBeVisible();
  await expect(admin.getByText(subject, { exact: true })).toBeVisible();
  const trigger = admin.getByRole("button", {
    name: "Ver consulta",
    exact: true,
  });
  await trigger.click();
  const dialog = admin.getByRole("dialog");
  await expect(dialog).toContainText("/contacto");
  await expect(dialog).toContainText("Mensaje de prueba para verificar");
  await expect(
    dialog.getByRole("button", { name: "Cerrar ventana" }),
  ).toBeFocused();
  await admin.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog
    .getByLabel("Estado", { exact: true })
    .selectOption("in_progress");
  await dialog
    .getByLabel("Notas internas", { exact: true })
    .fill("Recepción y seguimiento comprobados en navegador.");
  await dialog
    .getByRole("button", { name: "Guardar seguimiento", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(admin.getByRole("status")).toContainText(
    "Consulta actualizada.",
  );
  await expect(
    admin.getByRole("cell", { name: "En seguimiento", exact: true }),
  ).toBeVisible();
  await ctx.close();
  const other = await browser.newContext();
  const b = await other.newPage();
  await login(b, "adminB");
  await b.goto("/admin/contacts?q=" + encodeURIComponent(subject));
  await expect(
    b.getByText("No hay consultas para estos filtros."),
  ).toBeVisible();
  await other.close();
});

test("a changed privacy policy keeps the draft and requires fresh consent", async ({
  page,
}) => {
  test.setTimeout(90000);
  process.loadEnvFile(".env.local");
  if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:57321")
    throw new Error("Solo se permiten pruebas locales.");
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const auth = await db.auth.signInWithPassword(accounts.adminB);
  expect(auth.error).toBeNull();
  const checked = <T>(r: { data: T; error: unknown }) => {
    expect(r.error).toBeNull();
    return r.data;
  };
  const entryId = fixtures.B.entries["es-CL:/privacidad"];
  const entries = checked(
    await db.rpc("get_cms_listing", { p_site_id: fixtures.B.siteId }),
  );
  const entry = entries.find((e: { id: string }) => e.id === entryId);
  const snapshot = checked(
    await db.rpc("get_cms_snapshot", {
      p_revision_id: entry.published_revision_id,
    }),
  );
  await page.goto(fixtures.B.basePath + "/contacto");
  await page
    .getByLabel("Tu nombre", { exact: true })
    .fill("Prueba de política");
  await page
    .getByLabel("Correo electrónico", { exact: true })
    .fill("policy-browser@example.test");
  await page
    .getByLabel("Motivo de la consulta", { exact: true })
    .fill("Conservar este motivo");
  await page
    .getByLabel("¿En qué podemos ayudarte?", { exact: true })
    .fill("Este mensaje debe conservarse al actualizar la política.");
  await page.getByRole("checkbox").check();
  let changed: string | null = null;
  try {
    changed = checked(
      await db.rpc("save_content_revision", {
        p_entry_id: entryId,
        p_expected_revision_id: entry.revision_id,
        p_content: {
          ...snapshot,
          title: "Política actualizada para verificación",
        },
      }),
    );
    checked(
      await db.rpc("set_revision_state", {
        p_revision_id: changed,
        p_state: "approved",
      }),
    );
    checked(
      await db.rpc("publish_content_revision", { p_revision_id: changed }),
    );
    await page
      .getByRole("button", { name: "Enviar consulta", exact: true })
      .click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "La política de privacidad cambió" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Actualizar formulario", exact: true })
      .click();
    await expect(page.getByRole("checkbox")).not.toBeChecked();
    await expect(
      page.getByLabel("Motivo de la consulta", { exact: true }),
    ).toHaveValue("Conservar este motivo");
    await expect(
      page.getByLabel("¿En qué podemos ayudarte?", { exact: true }),
    ).toHaveValue("Este mensaje debe conservarse al actualizar la política.");
  } finally {
    if (changed) {
      const restored = checked(
        await db.rpc("save_content_revision", {
          p_entry_id: entryId,
          p_expected_revision_id: changed,
          p_content: snapshot,
        }),
      );
      checked(
        await db.rpc("set_revision_state", {
          p_revision_id: restored,
          p_state: "approved",
        }),
      );
      checked(
        await db.rpc("publish_content_revision", { p_revision_id: restored }),
      );
    }
  }
});
