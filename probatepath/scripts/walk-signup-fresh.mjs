#!/usr/bin/env node
// Fresh onboard→signup walk against latest deploy. Creates a new temporary
// user. After signup, the account is NOT restored — we delete the user row
// via the /api/ops/dev/test-walker endpoint when done? Actually we simply
// leave the account; it is clearly tagged with `+fresh<ts>@gmail.com` and
// contains no real data. This is test scaffolding and is documented in
// CLAUDE.md.
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://www.probatedesk.com";
const OUT = "/tmp/pd-signup";
mkdirSync(OUT, { recursive: true });

const TS = Date.now();
const EMAIL = `omarkebrahim+fresh${TS}@gmail.com`;
const PASSWORD = "AirpodsCurry3005!";
const NAME = "Omar Test";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 200)}`);
});
page.on("response", (r) => {
  if (r.status() >= 500) errors.push(`http[${r.status()}]: ${r.url().slice(0, 160)}`);
});

let step = 0;
async function snap(name) {
  step++;
  await page.screenshot({ path: join(OUT, `${String(step).padStart(2, "0")}-${name}.png`), fullPage: true });
  console.log(`${step} ${name.padEnd(26)} ${page.url()}`);
}

const clickByText = async (text) =>
  page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll("button, a, label")).find((el) =>
      (el.textContent || "").trim() === t,
    );
    if (b) { b.click(); return true; }
    return false;
  }, text);

const setInputs = async (obj) =>
  page.evaluate((vals) => {
    const set = (el, v) => {
      const s = Object.getOwnPropertyDescriptor(
        el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        "value",
      ).set;
      s.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll("input, textarea"));
    for (const el of inputs) {
      if (el.type === "hidden" || !el.offsetParent) continue;
      const name = el.name || el.id || el.type;
      if (vals[name]) set(el, vals[name]);
      else if (el.type === "email" && vals.__email) set(el, vals.__email);
      else if (el.type === "password" && vals.__password) set(el, vals.__password);
      else if (el.type === "tel" && vals.__phone) set(el, vals.__phone);
    }
  }, obj);

const waitNav = () => page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  console.log(`TEST EMAIL: ${EMAIL}`);
  await page.goto(BASE, { waitUntil: "networkidle2" });
  await snap("home");

  await page.goto(`${BASE}/onboard/executor`, { waitUntil: "networkidle2" });
  await snap("onboard-executor");
  await clickByText("Yes, I am the executor");
  await waitNav(); await delay(500);
  await snap("onboard-relationship");

  await clickByText("Parent");
  await waitNav(); await delay(500);
  await snap("onboard-email");

  await setInputs({ __email: EMAIL, __phone: "(604) 555-0100" });
  await clickByText("Continue");
  await waitNav(); await delay(500);
  await snap("onboard-call-choice");

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button, a")).find((el) =>
      /continue without/i.test(el.textContent || ""),
    );
    b?.click();
  });
  await waitNav(); await delay(500);
  await snap("onboard-screening-1");

  const answers = [
    "Yes",
    "Yes",
    "Yes",
    "Yes, I have the original",
    "Yes, everyone knows",
    "No, I don't expect any disputes",
    "No, all assets are in BC",
  ];
  for (const want of answers) {
    await page.evaluate((w) => {
      const b = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.textContent?.trim().toLowerCase().startsWith(w.toLowerCase()),
      );
      b?.click();
    }, want);
    await delay(500);
  }
  await delay(1500);
  await snap("onboard-result");

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button, a")).find((el) =>
      /continue with/i.test(el.textContent || ""),
    );
    b?.click();
  });
  await waitNav(); await delay(500);
  await snap("onboard-create-account");

  await setInputs({ __email: EMAIL, __password: PASSWORD, name: NAME });
  await page.evaluate((name) => {
    // Also set a "name" field if present
    for (const el of document.querySelectorAll('input[type="text"]')) {
      if (!el.value) {
        const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        s.call(el, name);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }, NAME);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((btn) =>
      /create account/i.test(btn.textContent || ""),
    );
    b?.click();
  });
  await waitNav(); await delay(2500);
  await snap("after-signup");

  await page.goto(`${BASE}/portal`, { waitUntil: "networkidle2" });
  await snap("portal-initial");
} catch (e) {
  console.log(`WALK ERROR: ${e.message}`);
  await snap("error-state").catch(() => {});
}

console.log("\n== errors ==");
for (const e of errors.slice(0, 20)) console.log(" ", e);
console.log(`\ntest email: ${EMAIL}`);
await browser.close();
