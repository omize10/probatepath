#!/usr/bin/env node
// Logged-in walk of every portal subpage. Screenshots + console errors + DOM checks.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-portal";
mkdirSync(OUT, { recursive: true });

const EMAIL = "omarkebrahim+pdwalk1775950692612@gmail.com";
const PASSWORD = "AirpodsCurry3005!";

const PAGES = [
  "/portal",
  "/portal/intake",
  "/portal/will-search",
  "/portal/p1-notices",
  "/portal/p1-tracker",
  "/portal/probate-filing",
  "/portal/post-grant",
  "/portal/documents",
  "/portal/notifications",
  "/portal/help",
  "/portal/process",
  "/portal/checklists",
  "/portal/info",
  "/portal/executors",
  "/portal/beneficiaries",
  "/portal/requisitions",
  "/portal/schedule",
  "/portal/screening",
  "/portal/steps",
  "/portal/next-step",
  "/portal/payment",
  "/portal/pricing",
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console[${page.url()}]: ${m.text().slice(0, 240)}`);
});
page.on("response", (r) => {
  if (r.status() >= 400 && r.status() !== 404)
    errors.push(`http[${r.status()}]: ${r.url().slice(0, 200)}`);
});

// 1. Log in
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.evaluate(({ e, p }) => {
  const inputs = Array.from(document.querySelectorAll("input"));
  const setV = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  setV(inputs[0], e);
  setV(inputs[1], p);
}, { e: EMAIL, p: PASSWORD });
await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button[type="submit"], button')).find((b) =>
    /sign in|log in/i.test(b.textContent || ""),
  );
  btn?.click();
});
await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 1500));
console.log(`logged in → ${page.url()}`);

const summary = [];
for (const path of PAGES) {
  try {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 25000 });
    await new Promise((r) => setTimeout(r, 800));
    const status = res?.status() ?? 0;
    const tag = path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
    await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });

    // DOM health check: any empty buttons, white-on-white text, missing alts
    const issues = await page.evaluate(() => {
      const out = [];
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.opacity !== "0";
      };
      // empty visible buttons/links
      for (const el of document.querySelectorAll("button, a")) {
        if (!visible(el)) continue;
        const text = (el.textContent || "").trim();
        const aria = el.getAttribute("aria-label") || "";
        const hasIcon = el.querySelector("svg, img") != null;
        if (!text && !aria && !hasIcon) out.push(`empty btn/a: ${el.outerHTML.slice(0, 100)}`);
        // white-text on white-bg detection
        const cs = getComputedStyle(el);
        if (text && cs.color === "rgb(255, 255, 255)") {
          // walk from element itself outward, find first opaque bg
          let node = el;
          let bg = "rgba(0, 0, 0, 0)";
          while (node && bg === "rgba(0, 0, 0, 0)") {
            bg = getComputedStyle(node).backgroundColor;
            node = node.parentElement;
          }
          // only flag if effective bg is actually white (or remained transparent all the way to root)
          if (bg === "rgb(255, 255, 255)")
            out.push(`white-on-white: "${text.slice(0, 40)}"`);
        }
      }
      // imgs missing alt
      const noAlt = Array.from(document.querySelectorAll("img")).filter((i) => !i.getAttribute("alt"));
      if (noAlt.length) out.push(`${noAlt.length} <img> missing alt`);
      // any text in serious red/error styling unexpectedly
      return out;
    });
    summary.push({ path, status, issues });
    console.log(`${status} ${path.padEnd(30)} ${issues.length ? "⚠ " + issues.length : "✓"}`);
    if (issues.length) for (const i of issues) console.log(`    ${i}`);
  } catch (e) {
    summary.push({ path, error: e.message });
    console.log(`ERR ${path}: ${e.message}`);
  }
}

console.log("\n=== ERRORS ===");
for (const e of errors.slice(0, 40)) console.log(e);

console.log("\n=== SUMMARY ===");
console.log(JSON.stringify(summary, null, 2));
await browser.close();
