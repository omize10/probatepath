import { test as base, type Page } from "@playwright/test";
import { bypassPasswordGate, registerTestUser, loginAsUser } from "./helpers/auth";
import { generateTestUser } from "./helpers/test-data";

type TestFixtures = {
  /** Page with password gate bypassed (not logged in) */
  gatelessPage: Page;
  /** Page with password gate bypassed AND a logged-in test user */
  authedPage: Page;
  /** Credentials of the auto-created test user */
  testUser: { name: string; email: string; password: string; id: string };
};

export const test = base.extend<TestFixtures>({
  gatelessPage: async ({ page }, use) => {
    await bypassPasswordGate(page);
    await use(page);
  },

  testUser: async ({ request }, use) => {
    const creds = generateTestUser();
    const result = await registerTestUser(request, creds);
    await use({ ...creds, id: result.id });
    // Cleanup handled by deleteTestUser if endpoint exists
  },

  authedPage: async ({ page, testUser }, use) => {
    await bypassPasswordGate(page);
    await loginAsUser(page, {
      email: testUser.email,
      password: testUser.password,
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
