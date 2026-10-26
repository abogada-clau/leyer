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
