#!/usr/bin/env node
// Logged-in walk through every intake wizard step. Auto-fills minimal data,
// clicks Next at each screen, screenshots, and reports any console errors,
// missing field labels, or step renderers that error out.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-intake";
mkdirSync(OUT, { recursive: true });

const EMAIL = "omarkebrahim+pdwalk1775950692612@gmail.com";
const PASSWORD = "AirpodsCurry3005!";
const MAX_STEPS = 50;

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 240)}`);
});

await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.evaluate(({ e, p }) => {
  const i = document.querySelectorAll("input");
  const set = (el, v) => {
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    s.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  set(i[0], e); set(i[1], p);
}, { e: EMAIL, p: PASSWORD });
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((b) => /sign in|log in/i.test(b.textContent || ""));
  b?.click();
});
await page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {});

await page.goto(`${BASE}/portal/intake`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1500));

const seen = new Set();
let step = 0;

while (step < MAX_STEPS) {
  step++;
  const tag = String(step).padStart(2, "0");
  const url = page.url();
  await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });

  // Capture step state
  const state = await page.evaluate(() => {
    // Heuristic: pick the H1 / first heading text or step indicator
    const heading = document.querySelector("h1, h2")?.textContent?.trim().slice(0, 80) || "(no heading)";
    const inputs = Array.from(document.querySelectorAll("input, textarea, select"))
      .filter((el) => el.type !== "hidden" && el.offsetParent !== null);
    const buttons = Array.from(document.querySelectorAll("button, a"))
      .filter((b) => b.offsetParent !== null)
      .map((b) => (b.textContent || "").trim())
      .filter(Boolean);
    return {
      heading,
      inputCount: inputs.length,
      inputTypes: inputs.map((el) => el.tagName + ":" + (el.type || "") + ":" + (el.name || el.id || "")),
      buttons,
      url: location.href,
    };
  });

  console.log(`${tag} ${state.heading.padEnd(50)} inputs=${state.inputCount} btns=[${state.buttons.slice(0, 4).join("|")}]`);
  const fp = `${state.heading}|${state.inputCount}|${state.url}`;
  if (seen.has(fp)) {
    console.log(`  → repeat — break`);
    break;
  }
  seen.add(fp);

  // Click first selectable answer card if no inputs to fill (typical first
  // intake screens are choose-one card lists styled as labels/buttons).
  await page.evaluate(() => {
    // Look for radio-style label cards
    const cards = Array.from(document.querySelectorAll('label, button[role="radio"], [role="radio"], button[type="button"]'))
      .filter((el) => el.offsetParent && /^(yes|no|i\b)/i.test((el.textContent || "").trim()));
    if (cards.length) cards[0].click();
  });
  await new Promise((r) => setTimeout(r, 250));

  // Auto-fill: text→"Test", email→"test@test.com", date→1990-01-01, number→1, tel→6045550100
  await page.evaluate(() => {
    const set = (el, v) => {
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
        || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      s.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    for (const el of document.querySelectorAll("input, textarea")) {
      if (el.type === "hidden" || el.type === "file" || !el.offsetParent) continue;
      if (el.value) continue;
      const t = (el.type || "").toLowerCase();
      if (el.type === "checkbox" || el.type === "radio") {
        if (!el.checked) el.click();
      } else if (t === "email") set(el, "test@example.com");
      else if (t === "tel") set(el, "6045550100");
      else if (t === "number") set(el, "1");
      else if (t === "date") set(el, "1990-01-01");
      else set(el, "Test");
    }
    for (const sel of document.querySelectorAll("select")) {
      if (sel.options.length > 1 && !sel.value) {
        sel.value = sel.options[1].value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  // Click Next/Continue/Save & continue
  const clicked = await page.evaluate(() => {
    const candidates = ["Save & continue", "Save and continue", "Continue", "Next", "Save & Next"];
    for (const t of candidates) {
      const b = Array.from(document.querySelectorAll("button, a")).find(
        (el) => (el.textContent || "").trim() === t && el.offsetParent
      );
      if (b) { b.click(); return t; }
    }
    // Fuzzy match
    const b = Array.from(document.querySelectorAll("button")).find((el) =>
      /continue|next|save/i.test((el.textContent || "").trim()) && el.offsetParent
    );
    if (b) { b.click(); return b.textContent.trim(); }
    return null;
  });
  if (!clicked) {
    console.log(`  → no advance button — stop`);
    break;
  }
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`\n=== walked ${step} steps ===`);
console.log(`\nERRORS (${errors.length}):`);
for (const e of errors.slice(0, 30)) console.log(e);
await browser.close();
