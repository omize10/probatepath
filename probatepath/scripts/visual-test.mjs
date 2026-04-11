#!/usr/bin/env node
// Visual regression / customer-flow walker for ProbateDesk.
// Usage: node scripts/visual-test.mjs [page-url...]
// Screenshots saved to /tmp/pd-shots/

import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const DEFAULT_PAGES = [
  ["home", "https://probatedesk.com/"],
  ["pricing", "https://probatedesk.com/pricing"],
  ["how-it-works", "https://probatedesk.com/how-it-works"],
  ["faqs", "https://probatedesk.com/faqs"],
  ["info", "https://probatedesk.com/info"],
  ["legal", "https://probatedesk.com/legal"],
  ["contact", "https://probatedesk.com/contact"],
  ["get-started", "https://probatedesk.com/get-started"],
  ["onboard-executor", "https://probatedesk.com/onboard/executor"],
  ["create-account", "https://probatedesk.com/create-account"],
  ["login", "https://probatedesk.com/login"],
  ["reset-password", "https://probatedesk.com/reset-password"],
];

const OUT = "/tmp/pd-shots";
mkdirSync(OUT, { recursive: true });

const pages = process.argv.slice(2).length
  ? process.argv.slice(2).map((u, i) => [`arg${i}`, u])
  : DEFAULT_PAGES;

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const report = [];

for (const [name, url] of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const failedRequests = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => failedRequests.push(`${req.failure()?.errorText} ${req.url()}`));

  const started = Date.now();
  let status = 0;
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    status = resp?.status() ?? 0;
  } catch (e) {
    consoleErrors.push(`navigation: ${e.message}`);
  }

  // Wait a beat for any late client-side stuff
  await new Promise((r) => setTimeout(r, 1500));

  const fileFull = join(OUT, `${name}-full.png`);
  const fileViewport = join(OUT, `${name}-viewport.png`);
  try {
    await page.screenshot({ path: fileFull, fullPage: true });
    await page.screenshot({ path: fileViewport, fullPage: false });
  } catch (e) {
    consoleErrors.push(`screenshot: ${e.message}`);
  }

  const title = await page.title().catch(() => "");
  const h1 = await page.$eval("h1", (el) => el.textContent?.trim() || "").catch(() => "");
  const elapsed = Date.now() - started;

  report.push({
    name,
    url,
    status,
    title,
    h1,
    consoleErrors,
    failedRequests,
    elapsed,
    fileFull,
    fileViewport,
  });

  await page.close();
  console.log(`[${name}] ${status} ${elapsed}ms  errors=${consoleErrors.length}  failed=${failedRequests.length}`);
  if (consoleErrors.length > 0) {
    for (const e of consoleErrors.slice(0, 3)) console.log(`   ⚠ ${e.slice(0, 180)}`);
  }
}

await browser.close();
console.log("\n=== SUMMARY ===");
for (const r of report) {
  console.log(`${r.name.padEnd(20)} ${r.status}  ${r.consoleErrors.length} errs  ${r.failedRequests.length} failed reqs`);
}
console.log(`\nScreenshots in ${OUT}/`);
