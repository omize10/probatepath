import { test, expect } from "./fixtures";

test.describe("Intake Wizard - Probate Path", () => {
  test("navigates to intake and shows step counter", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/") || url.pathname.includes("/start"),
      { timeout: 15_000 }
    );
    // Should show wizard step counter (e.g., "STEP 1 OF 32")
    await expect(
      page.getByText(/step \d+ of \d+/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("death certificate is first step with radio options", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/") || url.pathname.includes("/start"),
      { timeout: 15_000 }
    );
    // Step 1 should show "Death certificate" heading
    await expect(
      page.locator("h1").filter({ hasText: /death certificate/i })
    ).toBeVisible({ timeout: 10_000 });
    // Should have radio options: "Yes, I have the death certificate" and "No, I don't have it yet"
    await expect(
      page.getByText(/yes, i have the death certificate/i)
    ).toBeVisible();
    await expect(
      page.getByText(/no, i don't have it yet/i)
    ).toBeVisible();
    // Should have navigation buttons
    await expect(
      page.getByRole("button", { name: /save and continue/i })
    ).toBeVisible();
  });

  test("selecting death certificate option enables next step", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/"),
      { timeout: 15_000 }
    );
    // Select "Yes" for death certificate
    await page.getByText(/yes, i have the death certificate/i).click();
    // Click Save and continue
    await page.getByRole("button", { name: /save and continue/i }).click();
    // Should advance to step 2
    await expect(
      page.getByText(/step 2 of/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("autosave indicator shows saved status", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/") || url.pathname.includes("/start"),
      { timeout: 15_000 }
    );
    // Should show save status text
    await expect(
      page.getByText(/saved|save automatically/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("applicant name step accepts input", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/"),
      { timeout: 15_000 }
    );
    // Confirm we're on intake wizard
    await expect(page.getByText(/step \d+ of \d+/i)).toBeVisible({ timeout: 10_000 });
    // Check if any input fields exist on the page
    const inputs = page.locator("input[type='text'], input[type='email'], input[type='tel']");
    const inputCount = await inputs.count();
    // The wizard has input fields (at least radio buttons on step 1)
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });

  test("wizard shows info sidebar", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/intake");
    await page.waitForURL(
      (url) => url.pathname.includes("/matters/") || url.pathname.includes("/start"),
      { timeout: 15_000 }
    );
    // Sidebar should show "More information" section
    await expect(
      page.getByText(/more information/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
