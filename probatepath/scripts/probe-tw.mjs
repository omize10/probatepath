#!/usr/bin/env node
// Inspect computed styles on Download buttons to find the cascade root cause.
import puppeteer from "puppeteer";
const EMAIL = "omarkebrahim+pdwalk1775950692612@gmail.com";
const PASSWORD = "AirpodsCurry3005!";

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

await page.goto("https://probatedesk.com/login", { waitUntil: "networkidle2" });
await page.evaluate(({ e, p }) => {
  const inputs = Array.from(document.querySelectorAll("input"));
  const set = (el, v) => {
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    s.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  set(inputs[0], e); set(inputs[1], p);
}, { e: EMAIL, p: PASSWORD });
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((b) => /sign in|log in/i.test(b.textContent || ""));
  b?.click();
});
await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});

await page.goto("https://probatedesk.com/portal/documents", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1500));

const out = await page.evaluate(() => {
  // find a Download button/link
  const all = Array.from(document.querySelectorAll("button, a")).filter((el) =>
    /^download/i.test((el.textContent || "").trim()),
  );
  if (!all.length) return { error: "no Download" };
  const el = all[0];
  const cs = getComputedStyle(el);
  return {
    text: el.textContent.trim().slice(0, 30),
    className: el.className,
    color: cs.color,
    backgroundColor: cs.backgroundColor,
    backgroundImage: cs.backgroundImage,
    border: cs.border,
    fontSize: cs.fontSize,
    display: cs.display,
    width: el.getBoundingClientRect().width,
  };
});
console.log("DOWNLOAD button:", JSON.stringify(out, null, 2));

// Also probe the /portal Start intake (my recent fix)
await page.goto("https://probatedesk.com/portal", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1500));
const startIntake = await page.evaluate(() => {
  const a = document.querySelector('a[href="/start"]');
  if (!a) return { error: "no start" };
  const cs = getComputedStyle(a);
  return { color: cs.color, bg: cs.backgroundColor, border: cs.borderColor };
});
console.log("\n/portal Start intake:", JSON.stringify(startIntake, null, 2));

// Also fetch the actual Tailwind CSS and check whether bg-[color:var(--brand)] is in it
const cssLinks = await page.evaluate(() => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href));
console.log("\nstylesheets:", cssLinks);
for (const href of cssLinks) {
  const r = await page.evaluate(async (u) => {
    const t = await (await fetch(u)).text();
    const has = (s) => t.includes(s);
    return {
      url: u,
      length: t.length,
      hasBgBrand_colorPrefix: has("bg-\\[color\\:var\\(--brand\\)\\]") || has("bg-[color:var(--brand)]"),
      hasTextBrand_colorPrefix: has("text-\\[color\\:var\\(--brand\\)\\]"),
      hasBrandHex: has("#0d1726") || has("--brand"),
    };
  }, href);
  console.log(JSON.stringify(r));
}

await browser.close();
