import { test, expect } from "@playwright/test";

test("the sole public site works directly at the root on desktop and mobile", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".public-site h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.locator('a[href^="/sitios/"]').count()).toBe(0);
  }
});

test("removed client routes return 404", async ({ page }) => {
  for (const path of ["/sitios/albar-abogados/principal", "/sitios/estudio-local-a/principal"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  }
});

test("home hero is prioritized and visible before React hydration", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    // Let React's inline streaming instructions reveal the HTML, but prevent client hydration.
    await page.route("**/*", route => route.request().resourceType() === "script" ? route.abort() : route.continue());
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    const hero = page.locator(".block-hero img").first();
    await expect(hero).toHaveAttribute("loading", "eager");
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect(hero).toBeVisible();
    await expect(hero).not.toHaveClass(/opacity-0/);
    await expect(page.locator(".public-experience")).not.toHaveAttribute("data-enhanced", "true");
    await expect.poll(() => hero.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  } finally {
    await context.close();
  }
});
