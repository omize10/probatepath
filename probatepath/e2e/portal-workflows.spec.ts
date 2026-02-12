import { test, expect } from "./fixtures";

test.describe("Portal Workflows", () => {
  test("will search page loads for authenticated user", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/will-search");
    // Should stay on portal area (may redirect to portal home if no matter)
    await page.waitForURL(
      (url) => url.pathname.includes("/portal") || url.pathname.includes("/will-search"),
      { timeout: 15_000 }
    );
    // Page should render without crashing — check for portal branding
    await expect(
      page.getByText(/probatedesk|portal|will search/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("p1 notices page loads for authenticated user", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/p1-notices");
    await page.waitForURL(
      (url) => url.pathname.includes("/portal") || url.pathname.includes("/p1"),
      { timeout: 15_000 }
    );
    await expect(
      page.getByText(/probatedesk|portal|notice/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("documents page loads for authenticated user", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/documents");
    await page.waitForURL(
      (url) => url.pathname.includes("/portal") || url.pathname.includes("/documents"),
      { timeout: 15_000 }
    );
    await expect(
      page.getByText(/probatedesk|portal|document/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("checklists page loads with guides content", async ({
    authedPage: page,
  }) => {
    await page.goto("/portal/checklists");
    await page.waitForURL(
      (url) => url.pathname.includes("/portal") || url.pathname.includes("/checklists"),
      { timeout: 15_000 }
    );
    // From screenshot: heading says "Checklists and guides"
    await expect(
      page.getByRole("heading", { name: /checklists and guides/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});
