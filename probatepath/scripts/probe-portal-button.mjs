#!/usr/bin/env node
import puppeteer from "puppeteer";

const EMAIL = "omarkebrahim+pdwalk1775950692612@gmail.com";
const PASSWORD = "AirpodsCurry3005!";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

// login
await page.goto("https://probatedesk.com/login", { waitUntil: "networkidle2" });
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
  const btn = Array.from(document.querySelectorAll("button")).find((b) => /sign in|log in/i.test(b.textContent || ""));
  btn?.click();
});
await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 1500));

await page.goto("https://probatedesk.com/portal", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 2000));

const info = await page.evaluate(() => {
  const link = document.querySelector('a[href="/start"]');
  if (!link) return { found: false };
  const cs = getComputedStyle(link);
  const rect = link.getBoundingClientRect();
  return {
    found: true,
    text: link.textContent,
    innerHTML: link.innerHTML,
    color: cs.color,
    background: cs.backgroundColor,
    font: cs.fontFamily,
    fontSize: cs.fontSize,
    visibility: cs.visibility,
    opacity: cs.opacity,
    width: rect.width,
    height: rect.height,
    childCount: link.childNodes.length,
    children: Array.from(link.childNodes).map((c) => ({ type: c.nodeType, name: c.nodeName, text: c.textContent?.slice(0, 50) })),
  };
});
console.log(JSON.stringify(info, null, 2));

// Also check root brand var
const brand = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--brand"));
console.log("--brand:", JSON.stringify(brand));

await browser.close();
