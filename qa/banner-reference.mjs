import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: "no-preference",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4317");
await page.locator(".carousel-photo.is-active img").waitFor();
await page.evaluate(() => document.fonts.ready);
await page.mouse.move(500, 250);
const current = () =>
  page.locator(".carousel-photo.is-active img").getAttribute("src");
await expect.poll(current).toContain("thrive-banner-home");
await page.waitForTimeout(1200);
await page.screenshot({ path: "qa/banner-ref-1920.png" });
await expect.poll(current, { timeout: 8500 }).toContain("service-office");
await expect.poll(current, { timeout: 8500 }).toContain("service-airbnb");
await expect.poll(current, { timeout: 8500 }).toContain("thrive-banner-home");
await expect(page.locator(".carousel-hero .carousel-controls")).toHaveCount(0);
const pause = page.getByRole("button", { name: "Pause banner autoplay" });
await pause.focus();
await page.keyboard.press("Enter");
await page.locator(".carousel-accessible-toggle").blur();
const widths = [];
for (const width of [320, 390, 600, 768, 900, 1024, 1200, 1440, 1920, 2560]) {
  await page.setViewportSize({ width, height: 1080 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(100);
  const result = await page.evaluate(() => {
    const rect = (s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    };
    return {
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      header: rect(".header-inner"),
      text: rect(".carousel-content h1"),
      benefits: rect(".carousel-benefits"),
      caption: rect(".carousel-caption"),
      quote: rect(".reference-lead"),
    };
  });
  expect(result.scroll).toBeLessThanOrEqual(width + 1);
  expect(result.text.top).toBeGreaterThan(result.header.bottom);
  expect(result.quote.top).toBeGreaterThan(result.benefits.bottom);
  expect(result.quote.top).toBeGreaterThanOrEqual(result.caption.bottom - 1);
  widths.push(result);
  if ([390, 1024, 1440].includes(width))
    await page.screenshot({ path: `qa/banner-ref-${width}.png` });
}
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload();
const first = await current();
await page.waitForTimeout(6500);
expect(await current()).toBe(first);
await fs.writeFile(
  "qa/banner-reference-report.json",
  JSON.stringify(
    {
      loop: "1→2→3→1 with pointer over hero",
      controlsRemoved: true,
      widths,
      errors,
    },
    null,
    2,
  ),
);
expect(errors).toEqual([]);
await browser.close();
console.log(
  "PASS: autoplay loop while hovered, no visible controls, 10 responsive widths, reduced motion, no page errors.",
);
