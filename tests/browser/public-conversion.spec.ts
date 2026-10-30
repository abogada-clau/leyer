import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const fixtureFile = ".local/albar-fixtures.json";
const albar = existsSync(fixtureFile) ? JSON.parse(readFileSync(fixtureFile, "utf8")) : null;
const base = albar?.basePath;

test("home decisions: four clear destinations, complete area links and keyboard navigation", async ({ page }) => {
  test.skip(base == null, "Requiere el seed local de ALBAR.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const destinations = [
    "/personas/insolvencia-y-reemprendimiento",
    "/personas/derecho-de-familia/pension-de-alimentos",
    "/personas/derecho-de-familia/divorcios",
    "/empresas/insolvencia-y-reemprendimiento",
  ];
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1050 });
    await page.goto(base || "/");
    const section = page.locator('.public-site:visible [data-layout="decisions"]');
    await expect(section.getByRole("heading", { name: "¿Qué necesitas resolver hoy?", exact: true })).toBeVisible();
    const cards = section.locator(".public-service-item");
    await expect(cards).toHaveCount(4);
    for (const [index, path] of destinations.entries()) await expect(cards.nth(index)).toHaveAttribute("href", base + path);
    const overview = section.getByRole("navigation", { name: "Explorar todas las áreas" });
    await expect(overview.getByRole("link", { name: "Todas las áreas para personas" })).toHaveAttribute("href", base + "/personas");
    await expect(overview.getByRole("link", { name: "Todas las áreas para empresas" })).toHaveAttribute("href", base + "/empresas");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    if (width === 1440 || width === 390) {
      const sectionHeight = await section.evaluate(node => node.scrollHeight);
      await page.setViewportSize({ width, height: sectionHeight + 200 });
      await section.screenshot({
        path: `.local/albar-decisiones-${width}.png`,
        // Keep fixed page chrome out of the standalone section capture.
        style: ".public-header,.public-contact-dock,.public-skip{visibility:hidden!important}",
      });
      await page.setViewportSize({ width, height: 1050 });
    }
    await cards.first().focus();
    await expect(cards.first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(base + destinations[0]);
  }
  await page.goto(base || "/");
  await page.getByRole("navigation", { name: "Explorar todas las áreas" }).getByRole("link", { name: "Todas las áreas para empresas" }).click();
  await expect(page).toHaveURL(base + "/empresas");
  await expect(page.getByRole("heading", { name: "Más áreas en las que podemos ayudarte", exact: true })).toBeVisible();
});

test("public conversion: real contact destinations, mobile dock and reduced motion", async ({ page }) => {
  test.skip(base == null, "Requiere el seed local de ALBAR.");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base || "/");
  await expect(page.locator(".public-experience")).toHaveAttribute("data-enhanced", "true");
  await expect(page.locator(".block-hero .block-visual > figure > div")).toHaveAttribute("aria-busy", "false");
  await page.screenshot({ path: ".local/albar-conversion-desktop.png" });
  await page.locator(".public-header-contact").focus();
  await expect(page.locator(".public-header-contact")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(base + "/contacto");
  await expect(page.getByRole("button", { name: "Enviar consulta", exact: true })).toBeVisible();

  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base || "/");
    await expect(page.locator(".public-experience")).toHaveAttribute("data-enhanced", "true");
    // Next retains previous routes in hidden Activity boundaries.
    const dock = page.locator(".public-site:visible .public-contact-dock");
    await expect(dock).toBeVisible();
    if (width === 390) await page.screenshot({ path: ".local/albar-conversion-mobile.png" });
    await expect(dock.getByRole("link", { name: "WhatsApp", exact: true })).toHaveAttribute("href", "https://wa.me/56946978661");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.getByLabel("Abrir menú de navegación").press("Enter");
    await expect(dock).toBeHidden();
    await page.getByLabel("Abrir menú de navegación").press("Escape");
    await expect(dock).toBeVisible();
    await dock.getByRole("link", { name: "Consultar mi caso", exact: true }).press("Enter");
    await expect(page).toHaveURL(base + "/contacto");
    await page.getByLabel("Tu nombre", { exact: true }).focus();
    await expect(dock).toBeHidden();
    await expect(dock).toHaveAttribute("inert", "");
    await expect(page.getByLabel("Tu nombre", { exact: true })).toBeFocused();
    await page.goto(base || "/");
    await expect(dock).toBeVisible();
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base || "/");
  const guidance = page.locator(".public-service-guidance");
  await guidance.scrollIntoViewIfNeeded();
  await expect(guidance.getByRole("link", { name: "Hablemos de tu caso" })).toHaveAttribute("href", base + "/contacto");
  await expect(page.locator(".public-service-item").first()).toBeVisible();
  expect(await page.locator(".public-experience").evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
  await page.goto(base + "/personas/derecho-de-familia/divorcios");
  await page.getByRole("button", { name: "Enviar consulta", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("navigation", { name: "Contacto rápido", exact: true })).toBeHidden();
  expect(errors).toEqual([]);
});
