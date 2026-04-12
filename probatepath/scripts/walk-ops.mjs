#!/usr/bin/env node
// Walk the ops dashboard using an ops_auth cookie minted via the temporary
// /api/ops/dev/test-walker?cookie=... helper. TEMP — depends on the walker
// endpoint being deployed.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-ops";
mkdirSync(OUT, { recursive: true });
const KEY = "walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2";
const MATTER = "cmnv1x0nf000104l14ap3jxng";

const PAGES = [
  "/ops",
  "/ops/callbacks",
  "/ops/calendar",
  "/ops/messages",
  "/ops/messages/logs",
  "/ops/dev",
  `/ops/cases/${MATTER}`,
  "/ops/new-case",
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
  if (m.type() === "error") errors.push(`console[${page.url().slice(0, 60)}]: ${m.text().slice(0, 200)}`);
});
page.on("response", (r) => {
  if (r.status() >= 500) errors.push(`http[${r.status()}]: ${r.url().slice(0, 200)}`);
});

// Set ops_auth=1 directly on the browser cookie jar. The endpoint exists,
// but going through fetch puts the cookie on the fetch jar instead of the
// puppeteer browser, so we set it manually.
for (const domain of ["probatedesk.com", "www.probatedesk.com", ".probatedesk.com"]) {
  await page.setCookie({
    name: "ops_auth",
    value: "1",
    domain,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
}
console.log("ops_auth cookie set directly");

for (const path of PAGES) {
  try {
    const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 25000 });
    await new Promise((r) => setTimeout(r, 800));
    const tag = path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
    await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
    const st = r?.status() ?? 0;
    const info = await page.evaluate(() => ({
      h1: (document.querySelector("h1")?.textContent || "").trim().slice(0, 60),
      bodyText: (document.body.innerText || "").slice(0, 60).replace(/\s+/g, " "),
    }));
    console.log(`${st} ${path.padEnd(30)} "${info.h1}" / "${info.bodyText}"`);
  } catch (e) {
    console.log(`ERR ${path}: ${e.message}`);
  }
}

console.log(`\nERRORS (${errors.length}):`);
for (const e of errors.slice(0, 20)) console.log(`  ${e}`);
await browser.close();
