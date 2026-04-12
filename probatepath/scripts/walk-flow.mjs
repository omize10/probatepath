#!/usr/bin/env node
// Full customer-flow walk against production.
// Creates a real test account, walks the onboard questions, hits the intake,
// and screenshots every screen. Outputs to /tmp/pd-flow/
import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE = "https://probatedesk.com";
const OUT = "/tmp/pd-flow";
mkdirSync(OUT, { recursive: true });

const TEST_EMAIL = `omarkebrahim+pdwalk${Date.now()}@gmail.com`;
const TEST_PASSWORD = "AirpodsCurry3005!";
const TEST_NAME = "Omar Test";

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

const log = [];
let step = 0;
async function snap(name) {
  step++;
  const tag = `${String(step).padStart(2, "0")}-${name}`;
  await page.screenshot({ path: join(OUT, `${tag}.png`), fullPage: true });
  log.push(
    `${tag.padEnd(40)} url=${page.url()}  title=${await page
      .title()
      .catch(() => "")}`,
  );
  console.log(log[log.length - 1]);
}

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text().slice(0, 200)}`);
});

async function clickByText(text) {
  const clicked = await page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll("button, a")).find(
      (b) => b.textContent?.trim() === t,
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
  if (!clicked) {
    const all = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button, a"))
        .map((b) => b.textContent?.trim())
        .filter(Boolean)
        .slice(0, 20),
    );
    log.push(`  ✗ could not click "${text}" — available: ${all.join(" | ")}`);
    console.log(log[log.length - 1]);
    return false;
  }
  return true;
}

async function waitNav() {
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));
}

async function typeInto(selector, text) {
  await page.waitForSelector(selector, { timeout: 10000 });
  const els = await page.$$(selector);
  if (!els.length) return false;
  await els[0].click();
  await els[0].type(text, { delay: 15 });
  return true;
}

try {
  // 1. Homepage
  console.log(`test email: ${TEST_EMAIL}`);
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  await snap("home");

  // 2. Onboard exec
  await page.goto(`${BASE}/onboard/executor`, { waitUntil: "networkidle2" });
  await snap("onboard-executor");
  await clickByText("Yes, I am the executor");
  await waitNav();
  await snap("onboard-relationship");

  // 3. Relationship
  await clickByText("Parent");
  await waitNav();
  await snap("onboard-email");

  // 4. Email + phone
  await page.evaluate(
    ({ email }) => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const setV = (el, v) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set;
        setter.call(el, v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      setV(inputs[0], email);
      setV(inputs[1], email);
      setV(inputs[2], "(604) 555-0100");
    },
    { email: TEST_EMAIL },
  );
  await clickByText("Continue");
  await waitNav();
  await snap("onboard-call-choice");

  // 5. Skip the call
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button,a")).find((b) =>
      /continue without/i.test(b.textContent || ""),
    );
    btn?.click();
  });
  await waitNav();
  await snap("onboard-screening-q1");

  // 6. Screening — answer affirmatively, no red flags
  const answers = [
    "Yes", // have a will
    "Yes", // witnessed
    "Yes", // BC prepared
    "Yes, I have the original",
    "Yes, everyone knows",
    "No, I don't expect any disputes",
    "No, all assets are in BC",
  ];
  for (let i = 0; i < answers.length; i++) {
    const clicked = await page.evaluate((want) => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((b) => b.textContent?.trim().toLowerCase().startsWith(want.toLowerCase()));
      if (b) {
        b.click();
        return true;
      }
      return false;
    }, answers[i]);
    if (!clicked) {
      log.push(`  ✗ screening answer ${i + 1} not found: "${answers[i]}"`);
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  await new Promise((r) => setTimeout(r, 1500));
  await snap("onboard-result");

  // 7. Continue with recommended tier
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button,a")).find((b) =>
      /continue with/i.test(b.textContent || ""),
    );
    btn?.click();
  });
  await waitNav();
  await snap("onboard-create-account");

  // 8. Fill account form
  await page.evaluate(
    ({ name, password }) => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const setV = (el, v) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set;
        setter.call(el, v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      // [0]=email (prefilled), [1]=name, [2]=password, [3]=confirm
      setV(inputs[1], name);
      setV(inputs[2], password);
      setV(inputs[3], password);
    },
    { name: TEST_NAME, password: TEST_PASSWORD },
  );
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /^create account$/i.test(b.textContent?.trim() || ""),
    );
    btn?.click();
  });
  await waitNav();
  await new Promise((r) => setTimeout(r, 2000));
  await snap("after-signup");

  // 9. Direct navigate to intake resume point
  await page.goto(`${BASE}/portal`, { waitUntil: "networkidle2" });
  await snap("portal");

  // 10. Try /intake (may 404 or redirect)
  await page.goto(`${BASE}/intake`, { waitUntil: "networkidle2" }).catch(() => {});
  await snap("intake");
} catch (e) {
  console.log(`WALK ERROR: ${e.message}`);
  log.push(`walk error: ${e.message}`);
  await snap("error-state").catch(() => {});
}

await browser.close();
console.log("\n=== FLOW LOG ===");
for (const l of log) console.log(l);
console.log("\n=== PAGE ERRORS ===");
for (const e of errors.slice(0, 20)) console.log(e);
console.log(`\nScreenshots in ${OUT}/`);
console.log(`Test email: ${TEST_EMAIL}`);
