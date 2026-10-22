import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const fixtureFile = ".local/albar-fixtures.json";
const albar = existsSync(fixtureFile) ? JSON.parse(readFileSync(fixtureFile, "utf8")) : null;
const base = albar?.basePath;

test("public conversion: real contact destinations, mobile dock and reduced motion", async ({ page }) => {
  test.skip(!base, "Requiere el seed local de ALBAR.");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
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
    await page.goto(base);
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
    await page.goto(base);
    await expect(dock).toBeVisible();
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base);
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
