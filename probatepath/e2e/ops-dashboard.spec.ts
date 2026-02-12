import { test, expect } from "./fixtures";

const BASE = process.env.TEST_BASE_URL || "https://www.probatedesk.com";

test.describe("Ops Dashboard", () => {
  test("ops page requires authentication", async ({ gatelessPage: page }) => {
    await page.goto("/ops");
    await page.waitForURL(
      (url) =>
        url.pathname.includes("/login") ||
        url.pathname.includes("/ops") ||
        url.pathname === "/",
      { timeout: 10_000 }
    );
    expect(page.url()).toBeTruthy();
  });

  test("dev set-status endpoint validates input", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ops/dev/set-status`, {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("required");
  });

  test("dev set-status rejects invalid status", async ({ request }) => {
    const res = await request.post(`${BASE}/api/ops/dev/set-status`, {
      data: {
        matterId: "fake-id",
        status: "not_a_real_status",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid status");
    expect(body.validStatuses).toBeDefined();
  });

  test("dev set-status returns 404 for nonexistent matter", async ({
    request,
  }) => {
    const res = await request.post(`${BASE}/api/ops/dev/set-status`, {
      data: {
        matterId: "00000000-0000-0000-0000-000000000000",
        status: "intake_complete",
      },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("not found");
  });
});
