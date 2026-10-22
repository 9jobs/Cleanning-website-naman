import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  for (const route of ["/", "/services", "/contact", "/pricing"]) {
    await page.goto(`http://localhost:4317${route}`, {
      waitUntil: "networkidle",
    });
    for (const width of [
      320, 360, 390, 430, 600, 768, 810, 1024, 1280, 1440, 1920,
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(200);
      await page.evaluate(() => document.fonts.ready);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow ${route} ${width}`,
      );
      for (const image of await page.locator("a.logo img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate((image) => image.complete && image.naturalWidth > 0),
          )
          .toBe(true);
        const box = await image.boundingBox();
        assert(
          Math.abs(box.width / box.height - 3) < 0.02,
          `Logo distorted at ${width}`,
        );
        assert(
          box.x >= 0 && box.x + box.width <= width + 1,
          `Logo clipped at ${width}`,
        );
      }
      const overlaps = await page.locator(".site-header").evaluate((header) => {
        const nodes = [
          header.querySelector(".logo"),
          header.querySelector(".desktop-nav"),
          header.querySelector(".header-actions"),
          header.querySelector(".menu-toggle"),
        ]
          .filter(Boolean)
          .filter(
            (node) =>
              node.getBoundingClientRect().width > 0 &&
              getComputedStyle(node).display !== "none",
          );
        return nodes.some((a, i) =>
          nodes.slice(i + 1).some((b) => {
            const x = a.getBoundingClientRect(),
              y = b.getBoundingClientRect();
            return (
              Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 &&
              Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1
            );
          }),
        );
      });
      assert(!overlaps, `Header overlap ${route} ${width}`);
      if (route === "/" && [390, 1440].includes(width)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page
          .locator(".site-header")
          .screenshot({ path: `qa/logo-header-${width}.png` });
        await page.locator("footer").scrollIntoViewIfNeeded();
        await page
          .locator("footer")
          .screenshot({ path: `qa/logo-footer-${width}.png` });
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    "Passed: header/footer logos load without distortion, clipping, overlap or page overflow across 11 widths and 4 routes.",
  );
} finally {
  await browser.close();
}
