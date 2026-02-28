import { test as base, type Page } from "@playwright/test";
import { registerTestUser, loginAsUser } from "./helpers/auth";
import { generateTestUser } from "./helpers/test-data";

type TestFixtures = {
  /** Page with a logged-in test user */
  authedPage: Page;
  /** Credentials of the auto-created test user */
  testUser: { name: string; email: string; password: string; id: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({ request }, use) => {
    const creds = generateTestUser();
    const result = await registerTestUser(request, creds);
    await use({ ...creds, id: result.id });
    // Cleanup handled by deleteTestUser if endpoint exists
  },

  authedPage: async ({ page, testUser }, use) => {
    await loginAsUser(page, {
      email: testUser.email,
      password: testUser.password,
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
