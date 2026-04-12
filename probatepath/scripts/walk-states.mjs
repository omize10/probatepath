#!/usr/bin/env node
// Walk every portal status (state machine) and screenshot the portal pages
// while the matter sits in that state. Drives status transitions via the
// already-gated /api/ops/dev/set-status endpoint using an ops_auth cookie.
//
// This is a READ-ONLY-for-code script — it only flips the DB row; it does not
// modify any application code. After it finishes, call scripts/restore-test-matter.mjs
// to reset the row.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-states";
mkdirSync(OUT, { recursive: true });

const EMAIL = "omarkebrahim+pdwalk1775950692612@gmail.com";
const PASSWORD = "AirpodsCurry3005!";
const MATTER_ID = "cmnv1x0nf000104l14ap3jxng";
const OPS_PASSWORD = process.env.OPS_PASSWORD || "probatedesk-ops-2026";

const STATES = [
  "intake_complete",
  "will_search_prepping",
  "will_search_ready",
  "will_search_sent",
  "notices_in_progress",
  "notices_waiting_21_days",
  "probate_package_prepping",
  "probate_package_ready",
  "probate_filing_ready",
  "probate_filing_in_progress",
  "probate_filed",
  "waiting_for_grant",
  "grant_complete",
];

const PORTAL_PAGES = [
  "/portal",
  "/portal/will-search",
  "/portal/p1-notices",
  "/portal/probate-filing",
  "/portal/post-grant",
  "/portal/documents",
  "/portal/next-step",
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const allErrors = [];
page.on("pageerror", (e) => allErrors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") allErrors.push(`console: ${m.text().slice(0, 200)}`);
});

// 1. Acquire ops_auth cookie (the set-status route requires it)
const opsRes = await fetch(`${BASE}/api/ops-auth`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password: OPS_PASSWORD }),
});
if (!opsRes.ok) {
  console.error("ops-auth failed", opsRes.status, await opsRes.text());
  process.exit(1);
}
const opsCookie = opsRes.headers.get("set-cookie")?.split(";")[0] ?? "";
console.log("ops cookie acquired:", opsCookie.slice(0, 40));

// 2. Log in as test user
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.evaluate(({ e, p }) => {
  const i = document.querySelectorAll("input");
  const set = (el, v) => {
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    s.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  set(i[0], e); set(i[1], p);
}, { e: EMAIL, p: PASSWORD });
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((b) => /sign in|log in/i.test(b.textContent || ""));
  b?.click();
});
await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
console.log("logged in →", page.url());

const summary = [];
for (const state of STATES) {
  // Flip the matter status via the ops/dev endpoint
  const flip = await fetch(`${BASE}/api/ops/dev/set-status`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: opsCookie },
    body: JSON.stringify({ matterId: MATTER_ID, portalStatus: state }),
  });
  const ok = flip.ok;
  console.log(`\n== ${state} == (flip ${flip.status})`);
  if (!ok) {
    console.log("  ⚠", await flip.text());
    continue;
  }
  await new Promise((r) => setTimeout(r, 500));

  for (const path of PORTAL_PAGES) {
    try {
      const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 25000 });
      await new Promise((r) => setTimeout(r, 700));
      const tag = `${state}__${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}`;
      await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
      const issues = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("button, a")) {
          const cs = getComputedStyle(el);
          const txt = (el.textContent || "").trim();
          const rect = el.getBoundingClientRect();
          if (!txt || rect.width === 0) continue;
          if (cs.color !== "rgb(255, 255, 255)") continue;
          let n = el, bg = "rgba(0, 0, 0, 0)";
          while (n && bg === "rgba(0, 0, 0, 0)") { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; }
          if (bg === "rgb(255, 255, 255)") out.push(`white/white: "${txt.slice(0, 30)}"`);
        }
        return out;
      });
      console.log(`  ${r?.status()} ${path.padEnd(24)} ${issues.length ? "⚠ " + issues.join("; ") : "✓"}`);
      summary.push({ state, path, status: r?.status() ?? 0, issues });
    } catch (e) {
      console.log(`  ERR ${path}: ${e.message}`);
      summary.push({ state, path, error: e.message });
    }
  }
}

console.log(`\n=== TOTAL ERRORS (${allErrors.length}) ===`);
for (const e of allErrors.slice(0, 30)) console.log(e);

await browser.close();
console.log(`\ndone — screenshots in ${OUT}/`);
