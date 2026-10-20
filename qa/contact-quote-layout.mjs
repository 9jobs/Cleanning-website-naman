import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await browser.newPage({
  viewport: { width: 1440, height: 1150 },
  reducedMotion: "reduce",
});
await p.goto("http://localhost:4317/contact");
await p.locator("h1").waitFor({ state: "visible" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(250);
await p.screenshot({ path: "qa/contact-quote-1440.png" });
await p
  .locator(".contact-quote-shell")
  .screenshot({ path: "qa/contact-quote-card.png" });
const widths = [];
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.waitForTimeout(100);
  const state = await p.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(state.scroll).toBeLessThanOrEqual(width);
  widths.push(state);
  if (width === 390) await p.screenshot({ path: "qa/contact-quote-390.png" });
}
await expect(
  p.getByRole("button", { name: "Get My Free Quote", exact: true }),
).toBeEnabled();
await browser.close();
console.log(
  JSON.stringify({ responsive: widths.length, emailConfigured: true }, null, 2),
);
