import { test, expect } from "@playwright/test";

test.beforeEach(async ({ baseURL }) => {
  test.skip(!baseURL || !["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname), "Las pruebas de recuperación usan sesiones locales de prueba.");
});

test("password recovery requests the password callback on the current origin", async ({ page, baseURL }) => {
  let requestedRedirect: string | null = null;
  let requestedEmail: string | undefined;
  await page.route("**/auth/v1/recover**", async route => {
    requestedRedirect = new URL(route.request().url()).searchParams.get("redirect_to");
    requestedEmail = route.request().postDataJSON().email;
    await route.fulfill({ status: 200, json: {} });
  });
  await page.goto("/auth/forgot-password");
  await page.getByLabel("Correo electrónico", { exact: true }).fill("recovery@example.test");
  await page.getByRole("button", { name: "Solicitar recuperación", exact: true }).click();
  await expect(page.getByText("Solicitud de recuperación aceptada", { exact: true })).toBeVisible();
  expect(requestedEmail).toBe("recovery@example.test");
  expect(requestedRedirect).toBe(`${baseURL}/auth/callback?next=/auth/update-password`);
});

test("a missing recovery session keeps password updates disabled", async ({ page }) => {
  await page.goto("/auth/update-password");
  await expect(page.locator("form").getByRole("alert")).toContainText("Abre el enlace de recuperación de tu correo");
  await expect(page.getByRole("button", { name: "Guardar contraseña", exact: true })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Solicitar un enlace nuevo", exact: true })).toHaveAttribute("href", "/auth/forgot-password");
});

test("expired email links explain how to request a new link", async ({ page }) => {
  await page.goto("/auth/update-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired");
  await expect(page.locator("form").getByRole("alert")).toContainText("El enlace de recuperación no es válido o ha vencido.");
  await expect(page.getByRole("button", { name: "Guardar contraseña", exact: true })).toBeDisabled();
});

test("implicit email tokens establish a session and are removed from the address", async ({ page }) => {
  const user = {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    aud: "authenticated",
    email: "recovery@example.test",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const accessToken = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.local-fixture-signature`;
  await page.route("**/auth/v1/user", route => route.fulfill({ status: 200, json: user }));
  const hash = new URLSearchParams({ access_token: accessToken, refresh_token: "local-fixture-refresh", type: "recovery" });
  await page.goto(`/auth/update-password#${hash}`);
  await expect(page.getByRole("button", { name: "Guardar contraseña", exact: true })).toBeEnabled();
  expect(new URL(page.url()).hash).toBe("");
});

test("recovery confirmation defaults to the password page and establishes a session", async ({ page }) => {
  test.skip(process.env.ALBAR_RECOVERY_FIXTURE !== "true", "Requiere el servidor local de verificación de correo.");
  const response = await page.request.get("/auth/confirm?token_hash=test-recovery-token&type=recovery", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/auth/update-password");
  await page.goto("/auth/update-password");
  await expect(page.getByRole("button", { name: "Guardar contraseña", exact: true })).toBeEnabled();
  await expect(page.locator("form").getByRole("alert")).toHaveCount(0);
});
