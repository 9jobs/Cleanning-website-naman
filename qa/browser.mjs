import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4317");
await page.waitForLoadState("networkidle");
await page.screenshot({ path: "qa/home-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "qa/home-mobile.png", fullPage: true });
console.log(
  JSON.stringify({
    title: await page.title(),
    errors,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  }),
);
await fs.writeFile("qa/browser-baseline.json", JSON.stringify({ errors }));
await browser.close();
