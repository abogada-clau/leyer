import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

const fixtureFile = ".local/albar-fixtures.json";
const base = existsSync(fixtureFile) ? JSON.parse(readFileSync(fixtureFile, "utf8")).basePath : null;
const mutual = "/personas/derecho-de-familia/divorcios/mutuo-acuerdo";

test("service detail: reference structure, responsive reading, working FAQs and contact", async ({ page }) => {
  test.skip(base == null, "Requiere el seed local de ALBAR.");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + mutual);
    const article = page.locator(".template-service-landing:visible");
    await expect(article.getByRole("heading", { level: 1 })).toHaveText("Divorcio de mutuo acuerdo");
    await expect(article.locator(".block-hero .block-visual img")).toBeVisible();
    await expect(article.locator(".service-benefit")).toHaveCount(4);
    await expect(article.locator(".service-requirements li")).toHaveCount(5);
    await expect(article.locator(".public-steps li")).toHaveCount(4);
    const order = await article.locator(".content-blocks > section").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-block") || n.className));
    expect(order[0]).toBe("hero");
    expect(order.indexOf("related_content")).toBeLessThan(order.indexOf("faq"));
    expect(order.at(-1)).toBe("cta");
    const steps = await article.locator(".public-steps li").evaluateAll(nodes => nodes.map(n => ({ x: n.getBoundingClientRect().x, y: n.getBoundingClientRect().y })));
    if (width === 1440) expect(new Set(steps.map(step => step.y)).size).toBe(1);
    if (width === 390) expect(new Set(steps.map(step => step.x)).size).toBe(1);
    const question = article.locator(".block-faq summary").first();
    await question.focus();
    await page.keyboard.press("Enter");
    await expect(article.locator(".block-faq details").first()).toHaveAttribute("open", "");
    await expect(article.locator(".block-faq details").first().locator("p")).toBeVisible();
    await expect(article.locator(".block-cta .public-actions a").first()).toHaveAttribute("href", base + "/contacto");
    await expect(article.getByRole("link", { name: "Escríbenos por WhatsApp" })).toHaveAttribute("href", "https://wa.me/56946978661");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await question.evaluate(node => (node as HTMLElement).blur());
    await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
    if (width !== 820) await page.screenshot({ path: `.local/albar-servicio-${width}.png`, fullPage: true });
  }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.evaluate(() => { localStorage.setItem("theme", "dark"); });
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator(".template-service-landing:visible h1")).toBeVisible();
  await expect(page.locator(".template-service-landing:visible .block-hero .block-visual > figure > div")).toHaveAttribute("aria-busy", "false");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: ".local/albar-servicio-dark.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("service composition also applies to existing rich text and business services", async ({ page }) => {
  test.skip(base == null, "Requiere el seed local de ALBAR.");
  for (const path of ["/empresas/insolvencia-y-reemprendimiento", "/personas/derecho-de-familia/compensacion-economica", "/empresas/asesoria-preventiva-empresarial"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + path);
    const article = page.locator(".template-service-landing:visible");
    await expect(article.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(article.locator(".service-benefits")).toBeVisible();
    await expect(article.locator(".block-cta").last()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  }
});
