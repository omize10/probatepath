#!/usr/bin/env node
import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto("https://probatedesk.com/login", { waitUntil: "networkidle2" });
await page.evaluate(() => {
  const inputs = document.querySelectorAll("input");
  const set = (el, v) => {
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    s.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  set(inputs[0], "omarkebrahim+pdwalk1775950692612@gmail.com");
  set(inputs[1], "AirpodsCurry3005!");
});
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((b) => /sign in|log in/i.test(b.textContent || ""));
  b?.click();
});
await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});
await page.goto("https://probatedesk.com/portal/p1-notices", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1500));
const result = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll("a"));
  const link = links.find((a) => /Edit your answers/i.test(a.textContent || ""));
  if (!link) return { error: "not found" };
  const cs = getComputedStyle(link);
  // Check matched CSS rules
  const matched = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const r of sheet.cssRules) {
        if (r.selectorText && link.matches(r.selectorText) && r.style.color) {
          matched.push({ sel: r.selectorText, color: r.style.color });
        }
      }
    } catch {}
  }
  return {
    text: link.textContent.trim(),
    className: link.className,
    color: cs.color,
    border: cs.borderColor,
    bg: cs.backgroundColor,
    parent: link.parentElement?.className || "",
    parentColor: link.parentElement ? getComputedStyle(link.parentElement).color : null,
    matchedColorRules: matched,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
