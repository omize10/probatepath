import { test, expect } from "./fixtures";

test.describe("Portal Dashboard - Status States", () => {
  test("empty portal shows no active case message", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    // New user with no case sees the empty state
    await expect(
      page.getByText("We couldn't find an active case")
    ).toBeVisible({ timeout: 30_000 });
  });

  test("empty portal shows guide heading", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    await expect(
      page.getByRole("heading", { name: /guide you step by step/i })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("empty portal shows start intake link", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    // Should show "Start intake" link in the main portal area
    await expect(
      page.getByRole("link", { name: /start intake/i }).first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test("portal has navigation bar", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    // Portal nav should show
    await expect(
      page.getByText(/portal/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("portal shows sign out option", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    await expect(
      page.getByText(/sign out/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("clicking start intake navigates to intake", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    await expect(
      page.getByRole("link", { name: /start intake/i }).first()
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole("link", { name: /start intake/i }).first().click();
    // Should navigate to intake/start
    await page.waitForURL(
      (url) => url.pathname.includes("/start") || url.pathname.includes("/intake") || url.pathname.includes("/matters/"),
      { timeout: 15_000 }
    );
  });

  test("portal nav has Home, Documents, Help links", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    await page.waitForTimeout(2_000);
    // Navigation links
    const homeLink = page.getByRole("link", { name: /^home$/i });
    const docsLink = page.getByRole("link", { name: /documents/i });
    const helpLink = page.getByRole("link", { name: /^help$/i });
    await expect(homeLink).toBeVisible({ timeout: 10_000 });
    await expect(docsLink).toBeVisible();
    await expect(helpLink).toBeVisible();
  });

  test("portal displays client portal badge", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    await expect(
      page.getByText(/client portal/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("portal has probatedesk branding", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal");
    await expect(
      page.getByText(/probatedesk/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
