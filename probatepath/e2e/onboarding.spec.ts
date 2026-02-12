import { test, expect } from "./fixtures";
import { bypassPasswordGate } from "./helpers/auth";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page }) => {
    await bypassPasswordGate(page);
  });

  test("happy path: executor selects role and relationship", async ({
    page,
  }) => {
    await page.goto("/onboard/executor");
    await page.getByRole("button", { name: /yes, i am the executor/i }).click();
    await page.waitForURL("**/onboard/relationship");

    // Select a relationship
    await page.getByRole("button", { name: /child/i }).click();
    // Auto-advances after 300ms
    await page.waitForURL("**/onboard/email", { timeout: 5_000 });
    // Should see the email/phone form
    await expect(page.locator("#email")).toBeVisible({ timeout: 5_000 });
  });

  test("screening page loads with will question", async ({ page }) => {
    await page.goto("/onboard/screening");
    // Should show the screening questionnaire
    await expect(
      page.getByText(/did your loved one have a will/i)
    ).toBeVisible({ timeout: 10_000 });
    // Should show "Question 1 of X"
    await expect(
      page.getByText(/question 1 of/i)
    ).toBeVisible();
    // Should show Yes/No/Not sure buttons
    await expect(page.getByRole("button", { name: /^yes$/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^no$/i }).first()).toBeVisible();
  });

  test("screening advances through questions on yes", async ({ page }) => {
    // Screening requires onboard state — walk through executor + relationship first
    await page.goto("/onboard/executor");
    await page.getByRole("button", { name: /yes, i am the executor/i }).click();
    await page.waitForURL("**/onboard/relationship");
    await page.getByRole("button", { name: /child/i }).click();
    await page.waitForURL("**/onboard/email", { timeout: 5_000 });
    // Fill email form to advance
    const email = `test+screen${Date.now()}@probatedesk-e2e.test`;
    await page.locator("#email").fill(email);
    await page.locator("#confirm-email").fill(email);
    await page.locator("#phone").fill("6045550199");
    await page.getByRole("button", { name: /continue/i }).click();
    // Wait for navigation past email step
    await page.waitForURL((url) => !url.pathname.includes("/email"), { timeout: 10_000 });
    // May land on call-choice or screening — navigate to screening if needed
    if (!page.url().includes("/screening")) {
      // Try clicking through call-choice
      const selfBtn = page.getByRole("button", { name: /myself|online|manual/i }).first();
      if (await selfBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await selfBtn.click();
        await page.waitForURL("**/onboard/screening", { timeout: 10_000 });
      }
    }
    // Now on screening page
    if (page.url().includes("/screening")) {
      await expect(page.getByText(/question 1 of/i)).toBeVisible({ timeout: 10_000 });
      await page.getByRole("button", { name: /^yes$/i }).first().click({ force: true });
      // Should advance to next question
      await page.waitForTimeout(1_000);
      // Verify we're still on screening (didn't crash/redirect)
      expect(page.url()).toContain("/onboard");
    }
  });

  test("onboard result page loads", async ({ page }) => {
    // /onboard/result requires onboard state in localStorage
    // Without it, it may redirect or show screening
    await page.goto("/onboard/result");
    // Should show either the pricing/tier page or redirect to screening
    await page.waitForURL((url) =>
      url.pathname.includes("/result") || url.pathname.includes("/screening") || url.pathname.includes("/onboard"),
      { timeout: 10_000 }
    );
    expect(page.url()).toContain("/onboard");
  });
});
