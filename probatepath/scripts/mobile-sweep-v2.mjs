#!/usr/bin/env node
// Crash-proof mobile sweep: single browser + single page, navigates to each
// URL, screenshots, flags horizontal scroll / broken images. Previous
// version created a new page per URL which crashed on this machine.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT = "/tmp/pd-mobile";
mkdirSync(OUT, { recursive: true });

const BASE = "https://www.probatedesk.com";
const PAGES = [
  "/",
  "/how-it-works",
  "/pricing",
  "/get-started",
  "/faqs",
  "/info",
  "/legal",
  "/contact",
  "/onboard/executor",
  "/create-account",
  "/login",
  "/forgot-password",
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await page.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
);

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

const rows = [];
for (const path of PAGES) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    const info = await page.evaluate(() => ({
      bodyW: document.body.scrollWidth,
      viewW: window.innerWidth,
      docW: document.documentElement.scrollWidth,
      broken: Array.from(document.querySelectorAll("img")).filter(
        (i) => i.complete && i.naturalWidth === 0,
      ).length,
      whiteOnWhite: Array.from(document.querySelectorAll("button,a"))
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return false;
          const cs = getComputedStyle(el);
          if (cs.color !== "rgb(255, 255, 255)") return false;
          let n = el, bg = "rgba(0, 0, 0, 0)";
          while (n && bg === "rgba(0, 0, 0, 0)") { bg = getComputedStyle(n).backgroundColor; n = n.parentElement; }
          return bg === "rgb(255, 255, 255)";
        }).length,
    }));
    const tag = path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root";
    await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
    const hscroll = info.bodyW > info.viewW + 1;
    const status = hscroll ? "⚠ H-SCROLL" : "✓";
    const extra = [];
    if (info.broken) extra.push(`${info.broken} broken img`);
    if (info.whiteOnWhite) extra.push(`${info.whiteOnWhite} white/white`);
    console.log(`${path.padEnd(22)} ${status} body=${info.bodyW} view=${info.viewW} ${extra.join(" ")}`);
    rows.push({ path, hscroll, info });
  } catch (e) {
    console.log(`ERR ${path}: ${e.message}`);
  }
}

console.log(`\nerrors: ${errors.length}`);
for (const e of errors.slice(0, 10)) console.log(` ${e}`);
await browser.close();
