import { test, expect } from "./fixtures";

test.describe("Intake Wizard - Administration Path", () => {
  test("wizard loads with correct step count", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/") || url.pathname.includes("/start"),
      { timeout: 15_000 }
    );
    // Should show step counter
    await expect(
      page.getByText(/step \d+ of \d+/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("intake wizard has navigation buttons", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/"),
      { timeout: 15_000 }
    );
    await expect(
      page.getByRole("button", { name: /save and continue/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("wizard renders question cards", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/"),
      { timeout: 15_000 }
    );
    // Death certificate step should have radio-style question
    await expect(
      page.getByText(/do you have the death certificate/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("portal nav shows on intake page", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/"),
      { timeout: 15_000 }
    );
    // Portal nav should show Home, Documents, Help links
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: /documents/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Help", exact: true })).toBeVisible();
  });
});
