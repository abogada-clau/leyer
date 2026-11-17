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

test("public route resolution ignores client-supplied context", async ({ request }) => {
  const payload = Buffer.from(JSON.stringify({ requestPath: "/ruta-que-no-existe", issuedAt: Date.now() })).toString("base64url");
  const response = await request.get("/ruta-que-no-existe", {
    headers: { "x-albar-public-route": `${payload}.${"a".repeat(43)}` },
  });
  expect(response.status()).toBe(404);
  expect(response.headers()["x-albar-public-route"]).toBeUndefined();
});

test("the public theme selector keeps the system, dark and light options", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const select = page.getByRole("combobox", { name: "Cambiar tema" });
  await expect(select).toBeEnabled();
  await select.selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await select.selectOption("light");
  await expect(page.locator("html")).toHaveClass(/light/);
  await select.selectOption("system");
  await expect(page.locator("html")).toHaveClass(/light/);
});

test("access, design previews and missing pages display only the ALBAR brand", async ({ page }) => {
  const pages = [
    ["/auth/login", "ALBAR Abogados"],
    ["/auth/invite", "Invitación al panel · ALBAR Abogados"],
    ["/design-system", "Sistema de diseño · ALBAR Abogados"],
    ["/site-unavailable", "Página no disponible · ALBAR Abogados"],
  ];
  for (const [path, title] of pages) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("body")).not.toContainText(/\bleyer\b/i);
    await expect(page.locator('[aria-label*="leyer" i], [alt*="leyer" i], [title*="leyer" i]')).toHaveCount(0);
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
