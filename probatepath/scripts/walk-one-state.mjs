#!/usr/bin/env node
// Screenshot the portal pages for a single pre-set state name. The state is
// NOT flipped by this script — caller (SQL via MCP) flips `Matter.portalStatus`
// beforehand. Output: /tmp/pd-states/<state>__<page>.png
//
// TEST DATA: walks the seeded test account. See CLAUDE.md "Test data &
// operator scripts" for the scripts that set and restore this matter.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-states";
mkdirSync(OUT, { recursive: true });

const EMAIL = "omarkebrahim+pdwalk1775950692612@gmail.com";
const PASSWORD = "AirpodsCurry3005!";
const state = process.argv[2] || "unknown";

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

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
});

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

const results = [];
for (const path of PORTAL_PAGES) {
  try {
    const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 500));
    const tag = `${state}__${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}`;
    await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
    const issues = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("button, a")) {
        const cs = getComputedStyle(el);
        const txt = (el.textContent || "").trim();
        if (!txt || el.getBoundingClientRect().width === 0) continue;
        if (cs.color !== "rgb(255, 255, 255)") continue;
        let n = el, bg = "rgba(0, 0, 0, 0)";
        while (n && bg === "rgba(0, 0, 0, 0)") { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; }
        if (bg === "rgb(255, 255, 255)") out.push(`white/white: "${txt.slice(0, 30)}"`);
      }
      return out;
    });
    const status = r?.status() ?? 0;
    results.push({ path, status, issues });
    console.log(`  ${status} ${path.padEnd(24)} ${issues.length ? "⚠ " + issues.join("; ") : "✓"}`);
  } catch (e) {
    console.log(`  ERR ${path}: ${e.message}`);
    results.push({ path, error: e.message });
  }
}

if (errors.length) {
  console.log(`  errors: ${errors.length}`);
  for (const e of errors.slice(0, 5)) console.log(`    ${e}`);
}

await browser.close();
