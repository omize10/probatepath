#!/usr/bin/env node
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.goto("https://probatedesk.com/pricing", { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));

// Scroll to and screenshot the 3 tier cards
const cardsContainer = await page.$("div.grid.md\\:grid-cols-3");
if (cardsContainer) {
  await cardsContainer.scrollIntoView();
  await new Promise((r) => setTimeout(r, 500));
  await cardsContainer.screenshot({ path: "/tmp/pd-shots/pricing-cards-zoom.png" });
  console.log("saved /tmp/pd-shots/pricing-cards-zoom.png");
}

// Also grab DOM + computed styles for the Standard card's RECOMMENDED badge
const badgeData = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll("h3, .portal-badge"));
  const badge = document.querySelector(".portal-badge");
  const badgeRect = badge?.getBoundingClientRect();
  const badgeStyle = badge ? getComputedStyle(badge) : null;
  const badgeParent = badge?.parentElement;
  const badgeParentRect = badgeParent?.getBoundingClientRect();
  // Find the standard card (the one containing the badge, walking up to the Card root)
  let cardRoot = badge;
  while (cardRoot && !cardRoot.className?.toString?.().includes("border-2")) {
    cardRoot = cardRoot.parentElement;
  }
  const cardRect = cardRoot?.getBoundingClientRect();
  const cardStyle = cardRoot ? getComputedStyle(cardRoot) : null;
  return {
    badge: badgeRect ? { top: badgeRect.top, left: badgeRect.left, height: badgeRect.height, width: badgeRect.width } : null,
    badgeText: badge?.textContent,
    badgeBg: badgeStyle?.backgroundColor,
    badgeColor: badgeStyle?.color,
    badgeBorderRadius: badgeStyle?.borderRadius,
    badgeParentPos: badgeParentRect ? { top: badgeParentRect.top, left: badgeParentRect.left } : null,
    card: cardRect ? { top: cardRect.top, left: cardRect.left, height: cardRect.height, width: cardRect.width } : null,
    cardBorderTopWidth: cardStyle?.borderTopWidth,
    cardBorderRadius: cardStyle?.borderTopLeftRadius,
  };
});
console.log("badge debug:", JSON.stringify(badgeData, null, 2));

await browser.close();
