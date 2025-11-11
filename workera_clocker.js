#!/usr/bin/env node
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const { chromium } = require("playwright");

const LOGIN_URL = "https://workera.com/portal/login";

function resolveCredentials() {
  const email = process.env.WORKERA_EMAIL;
  const password = process.env.WORKERA_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing credentials. Define WORKERA_EMAIL and WORKERA_PASSWORD in .env or the environment."
    );
  }

  return { email, password };
}

function resolveAction(now = new Date()) {
  return now.getHours() < 12 ? "entrada" : "salida";
}

async function fillFirst(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    try {
      await locator.waitFor({ state: "visible", timeout: 5_000 });
      await locator.fill(value);
      return;
    } catch (error) {
      // try next selector
    }
  }
  throw new Error(`None of the selectors matched: ${selectors.join(", ")}`);
}

async function waitAndClick(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 10_000 });
  await locator.click();
}

async function main() {
  const { email, password } = resolveCredentials();
  const action = resolveAction();
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(LOGIN_URL, { waitUntil: "networkidle" });

    await fillFirst(
      page,
      [
        'input[name="formUsername"]',
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="correo"]',
      ],
      email
    );

    await fillFirst(
      page,
      [
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="Contraseña"]',
      ],
      password
    );

    await page.click('button[data-v-3c382841]');
    await page.waitForLoadState("networkidle");

    await waitAndClick(page, 'text="Marcar asistencia"');
    await waitAndClick(page, `text="${actionLabel}"`);

    const confirmationLabel = `Marcar ${action}`;
    await waitAndClick(page, `text="${confirmationLabel}"`);

    await page.waitForTimeout(1_500);
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
