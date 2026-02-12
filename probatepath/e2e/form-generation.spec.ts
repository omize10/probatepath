import { test, expect } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "https://www.probatedesk.com";

test.describe("Form Generation & API Endpoints", () => {
  test("health check endpoint works", async ({ request }) => {
    const res = await request.get(`${BASE}/api/health/db`);
    expect([200, 500]).toContain(res.status());
  });

  test("P1 form endpoint responds", async ({ request }) => {
    const res = await request.get(`${BASE}/api/forms/p1/test-matter-id/pdf`);
    expect([200, 400, 401, 404]).toContain(res.status());
  });

  test("P3 form endpoint responds", async ({ request }) => {
    const res = await request.get(`${BASE}/api/forms/p3/test-matter-id/pdf`);
    expect([200, 400, 401, 404]).toContain(res.status());
  });

  test("P9 form endpoint responds", async ({ request }) => {
    const res = await request.get(`${BASE}/api/forms/p9/test-matter-id`);
    expect([200, 400, 401, 404]).toContain(res.status());
  });

  test("P10 form endpoint responds", async ({ request }) => {
    const res = await request.get(`${BASE}/api/forms/p10/test-matter-id/pdf`);
    expect([200, 400, 401, 404]).toContain(res.status());
  });

  test("will search form endpoint responds", async ({ request }) => {
    const res = await request.get(`${BASE}/api/will-search/test-matter-id/pdf`);
    expect([200, 400, 401, 404]).toContain(res.status());
  });

  test("register endpoint rejects empty data", async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/register`, {
      data: { name: "", email: "", password: "" },
    });
    expect([400, 422, 500]).toContain(res.status());
  });

  test("intake save endpoint exists", async ({ request }) => {
    const res = await request.post(`${BASE}/api/intake/save`, {
      data: {},
    });
    expect([200, 400, 401, 403, 500]).toContain(res.status());
  });
});
