#!/usr/bin/env node
// Visual walk of marketing pages, including console errors and dom checks.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-marketing";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  "/",
  "/how-it-works",
  "/pricing",
  "/get-started",
  "/faqs",
  "/info",
  "/about",
  "/legal",
  "/contact",
  "/onboard/executor",
  "/login",
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
  if (m.type() === "error") errors.push(`console[${page.url().slice(0, 60)}]: ${m.text().slice(0, 200)}`);
});
page.on("response", (r) => {
  if (r.status() >= 400 && r.status() !== 404)
    errors.push(`http[${r.status()}]: ${r.url().slice(0, 200)}`);
});

const results = [];
for (const path of PAGES) {
  try {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 25000 });
    await new Promise((r) => setTimeout(r, 1500));
    const tag = path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
    await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
    const status = res?.status() ?? 0;

    const issues = await page.evaluate(() => {
      const out = [];
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0;
      };
      // Empty CTAs
      for (const el of document.querySelectorAll("button, a")) {
        if (!visible(el)) continue;
        const text = (el.textContent || "").trim();
        const aria = el.getAttribute("aria-label") || "";
        const hasIcon = el.querySelector("svg, img") != null;
        if (!text && !aria && !hasIcon) out.push(`empty btn/a`);
      }
      // White-text on white element-bg
      for (const el of document.querySelectorAll("button, a")) {
        if (!visible(el)) continue;
        const text = (el.textContent || "").trim();
        if (!text) continue;
        const cs = getComputedStyle(el);
        if (cs.color !== "rgb(255, 255, 255)") continue;
        let node = el;
        let bg = "rgba(0, 0, 0, 0)";
        while (node && bg === "rgba(0, 0, 0, 0)") {
          bg = getComputedStyle(node).backgroundColor;
          node = node.parentElement;
        }
        if (bg === "rgb(255, 255, 255)") out.push(`white/white: "${text.slice(0, 40)}"`);
      }
      // Horizontal scroll
      if (document.body.scrollWidth > window.innerWidth + 1) {
        out.push(`H-scroll body=${document.body.scrollWidth}`);
      }
      // Broken images
      const broken = Array.from(document.querySelectorAll("img")).filter((i) => i.complete && i.naturalWidth === 0);
      if (broken.length) out.push(`${broken.length} broken <img>`);
      return out;
    });
    results.push({ path, status, issues });
    console.log(`${status} ${path.padEnd(22)} ${issues.length ? "⚠ " + issues.join(" | ") : "✓"}`);
  } catch (e) {
    console.log(`ERR ${path}: ${e.message}`);
    results.push({ path, error: e.message });
  }
}

console.log("\n=== ERRORS ===");
for (const e of errors.slice(0, 30)) console.log(e);
await browser.close();
