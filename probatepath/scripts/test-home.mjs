#!/usr/bin/env node
// Test the homepage ReceiptComparison section with real scroll + wait.
import puppeteer from "puppeteer";
const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const pg = await b.newPage();
await pg.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await pg.goto("https://probatedesk.com/", { waitUntil: "networkidle2", timeout: 30000 });

// Scroll through the page slowly to trigger all intersection observers
await pg.evaluate(async () => {
  const distance = 200;
  const delay = 80;
  const total = document.body.scrollHeight;
  for (let y = 0; y <= total; y += distance) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, delay));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 500));
});

// Find the ReceiptComparison section and screenshot it
const section = await pg.$("section.relative.left-1\\/2.w-screen");
if (section) {
  await section.scrollIntoView();
  await new Promise((r) => setTimeout(r, 2500)); // let all motion animations finish
  await section.screenshot({ path: "/tmp/pd-shots/home-receipts-section.png" });
  console.log("saved home-receipts-section.png");
}

// Also: capture the full home page AFTER scrolling so isInView has fired
await pg.screenshot({ path: "/tmp/pd-shots/home-full-after-scroll.png", fullPage: true });
console.log("saved home-full-after-scroll.png");

// Check if receipt content exists in DOM
const domCheck = await pg.evaluate(() => {
  const smith = document.body.innerText.includes("SMITH & ASSOCIATES");
  const bcPackage = document.body.innerText.includes("BC Probate Document Package");
  const totalDue = document.body.innerText.includes("TOTAL DUE");
  const recText = document.body.innerText.includes("Where does your money actually go");
  return { smith, bcPackage, totalDue, recText };
});
console.log("DOM content check:", JSON.stringify(domCheck));

await b.close();
