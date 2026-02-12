import { test, expect } from "./fixtures";
import { bypassPasswordGate } from "./helpers/auth";
import { generateTestUser } from "./helpers/test-data";

test.describe("Authentication Flow", () => {
  test("password gate blocks access and accepts correct code", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Enter Password")).toBeVisible();
    // Wrong password
    await page.locator("input[type='password'], input[type='text']").first().fill("0000");
    await page.getByRole("button", { name: /access/i }).click();
    await expect(page.getByText(/incorrect/i)).toBeVisible();
    // Correct password
    await page.locator("input[type='password'], input[type='text']").first().fill("2929");
    await page.getByRole("button", { name: /access/i }).click();
    await expect(page.getByText("Enter Password")).not.toBeVisible({ timeout: 10_000 });
  });

  test("register a new account", async ({ gatelessPage: page }) => {
    const user = generateTestUser();
    await page.goto("/register");
    await page.locator("#name").fill(user.name);
    await page.locator("#email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.locator("#confirm").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL((url) => !url.pathname.includes("/register"), {
      timeout: 15_000,
    });
    const url = page.url();
    expect(
      url.includes("/portal") || url.includes("/start") || url.includes("/pricing") || url.includes("/pay")
    ).toBeTruthy();
  });

  test("login with valid credentials", async ({
    gatelessPage: page,
    testUser,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill(testUser.email);
    await page.locator("#password").fill(testUser.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    });
    expect(page.url()).not.toContain("/login");
  });

  test("login with bad password shows error", async ({
    gatelessPage: page,
    testUser,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill(testUser.email);
    await page.locator("#password").fill("WrongPassword999!");
    await page.getByRole("button", { name: "Sign in" }).click();
    // NextAuth shows "CredentialsSignin" on failure
    await expect(
      page.getByText(/CredentialsSignin|invalid|incorrect|wrong|failed|error/i).first()
    ).toBeVisible({ timeout: 15_000 });
    expect(page.url()).toContain("/login");
  });

  test("protected portal route redirects to login", async ({
    gatelessPage: page,
  }) => {
    await page.goto("/portal");
    await page.waitForURL((url) => url.pathname.includes("/login"), {
      timeout: 10_000,
    });
    expect(page.url()).toContain("/login");
  });

  test("forgot password flow initiates reset", async ({
    gatelessPage: page,
    testUser,
  }) => {
    await page.goto("/forgot-password");
    await page.locator("#email").fill(testUser.email);
    await page.getByRole("button", { name: /send reset code/i }).click();
    await page.waitForURL((url) => url.pathname.includes("/reset-password"), {
      timeout: 10_000,
    });
    expect(page.url()).toContain("/reset-password");
  });
});
