#!/usr/bin/env node
// Screenshot key pages at iPhone 14 viewport.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT = "/tmp/pd-shots-mobile";
mkdirSync(OUT, { recursive: true });

const pages = [
  ["home", "https://probatedesk.com/"],
  ["pricing", "https://probatedesk.com/pricing"],
  ["how-it-works", "https://probatedesk.com/how-it-works"],
  ["get-started", "https://probatedesk.com/get-started"],
  ["faqs", "https://probatedesk.com/faqs"],
  ["info", "https://probatedesk.com/info"],
  ["onboard-executor", "https://probatedesk.com/onboard/executor"],
  ["create-account", "https://probatedesk.com/create-account"],
  ["login", "https://probatedesk.com/login"],
  ["contact", "https://probatedesk.com/contact"],
  ["legal", "https://probatedesk.com/legal"],
];

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (const [name, url] of pages) {
  const page = await browser.newPage();
  // iPhone 14 / 390 x 844 @ 3x
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  );
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (e) {
    console.log(`  ${name} nav error: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
  // Check for horizontal scroll (a common mobile break)
  const overflow = await page.evaluate(() => {
    const b = document.body;
    const d = document.documentElement;
    return {
      bodyWidth: b.scrollWidth,
      viewWidth: window.innerWidth,
      hasHorizontalScroll: b.scrollWidth > window.innerWidth + 1,
      docWidth: d.scrollWidth,
    };
  });
  try {
    await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
  } catch (e) {
    console.log(`  ${name} screenshot error: ${e.message}`);
  }
  console.log(
    `${name.padEnd(18)} ${
      overflow.hasHorizontalScroll ? "⚠ H-SCROLL" : "✓ "
    } body=${overflow.bodyWidth} view=${overflow.viewWidth}`,
  );
  await page.close();
}

await browser.close();
console.log(`\nScreenshots in ${OUT}/`);
