import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import sharp from "sharp";

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
await page.route("**/api/**", (route) => route.abort());
await page.goto("http://localhost:4317/contact");
await page.evaluate(() => document.fonts.ready);
await page.locator("#contact-name").waitFor();
for (const [selector, name] of [
  [".site-header", "header"],
  ["main", "contact"],
]) {
  const current = await page.locator(selector).screenshot();
  const baseline = await fs.readFile(`qa/footer-${name}-before.png`);
  const currentPixels = await sharp(current).raw().toBuffer();
  const baselinePixels = await sharp(baseline).raw().toBuffer();
  assert(
    currentPixels.equals(baselinePixels),
    `${name} changed outside footer`,
  );
}
const footer = page.locator("footer");
const originalLinks = JSON.parse(
  await fs.readFile("qa/footer-links-before.json", "utf8"),
);
const currentLinks = await footer
  .locator("a")
  .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
for (const { href } of originalLinks)
  assert(currentLinks.includes(href), `Missing existing footer link: ${href}`);
for (const name of ["Facebook", "Instagram", "LinkedIn", "YouTube"]) {
  await expect(footer.getByRole("img", { name, exact: true })).toBeVisible();
}
assert(!currentLinks.includes("#"), "No fake link destinations");
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920, 2172]) {
  await page.setViewportSize({ width, height: 1000 });
  await footer.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      footer.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
  const geometry = await footer.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const overflow = [
      ...element.querySelectorAll("a, p, h2, address, li, [role=img]"),
    ]
      .filter((child) => {
        const r = child.getBoundingClientRect();
        return r.left < -1 || r.right > window.innerWidth + 1;
      })
      .map((child) => child.textContent);
    return {
      width: rect.width,
      scroll: document.documentElement.scrollWidth,
      overflow,
      animations: element.getAnimations({ subtree: true }).length,
    };
  });
  assert.equal(geometry.scroll, width, `Page overflow at ${width}`);
  assert.deepEqual(geometry.overflow, [], `Footer overflow at ${width}`);
  assert.equal(geometry.animations, 0, "Footer stays static");
  if ([390, 768, 1440, 1920, 2172].includes(width)) {
    await footer.screenshot({
      path: `qa/footer-final-${width}.png`,
      style:
        ".site-header, .skip-link, nextjs-portal, .back-top { visibility: hidden !important; }",
    });
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await footer
  .getByRole("link", { name: "Contact Our Team", exact: true })
  .focus();
assert(
  await page.evaluate(
    () => getComputedStyle(document.activeElement).outlineStyle !== "none",
  ),
);
await footer.getByRole("link", { name: "House Cleaning", exact: true }).click();
await page.waitForURL("**/services/house-cleaning");
await expect(page.locator("h1")).toContainText("House Cleaning");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  JSON.stringify({
    viewports: 9,
    existingLinksRetained: originalLinks.length,
    protectedHeaderAndContactPixelsUnchanged: true,
    socialIconsOnly: true,
    serviceNavigation: true,
    visibleKeyboardFocus: true,
    footerAnimations: 0,
    submissions: 0,
    errors,
  }),
);
