import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL || "https://www.probatedesk.com";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [["html"], ["list"]],
  timeout: 90_000,

  use: {
    baseURL: BASE_URL,
    actionTimeout: 30_000,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
