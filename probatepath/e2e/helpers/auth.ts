import type { Page, APIRequestContext } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "https://www.probatedesk.com";

/** Set localStorage flag so the PasswordGate component doesn't block the page */
export async function bypassPasswordGate(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("probate_desk_auth", "true");
  });
}

/** Register a new user via the API (skipping the UI for speed) */
export async function registerTestUser(
  request: APIRequestContext,
  user: { name: string; email: string; password: string }
) {
  const res = await request.post(`${BASE}/api/auth/register`, { data: user });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Register failed (${res.status()}): ${body}`);
  }
  return res.json() as Promise<{ success: boolean; id: string; email: string }>;
}

/** Fill the login form and submit, waiting for redirect */
export async function loginAsUser(
  page: Page,
  { email, password }: { email: string; password: string }
) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait for NextAuth to redirect after successful login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });
}

/** Convenience: bypass gate + login in one call */
export async function setupAuthenticatedPage(
  page: Page,
  creds: { email: string; password: string }
) {
  await bypassPasswordGate(page);
  await loginAsUser(page, creds);
}
