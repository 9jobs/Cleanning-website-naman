import assert from "node:assert/strict";
import fs from "node:fs/promises";
import sharp from "sharp";
import { chromium, expect } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/**", (route) =>
  route.request().method() === "POST" ? route.abort() : route.continue(),
);
await page.goto("http://localhost:4317/");
await page.evaluate(() => document.fonts.ready);
const services = page.locator(".service-showcase");
const guides = page.locator(".journal-section");
await expect(services.locator(".service-tile")).toHaveCount(6);
await expect(guides.locator(".article-card")).toHaveCount(6);
const photos = await page
  .locator(
    ".service-showcase .service-tile img, .journal-section .article-card img",
  )
  .evaluateAll((images) =>
    images.map((image) => {
      const url = new URL(image.currentSrc || image.src, location.href);
      return url.searchParams.get("url") || url.pathname;
    }),
  );
assert.equal(
  new Set(photos).size,
  12,
  "The two previews must have different images",
);
const results = [];
const screenshotStyle =
  ".site-header,.skip-link,.back-top,nextjs-portal{visibility:hidden!important}";
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1100 });
  for (const section of [services, guides]) {
    await section.scrollIntoViewIfNeeded();
    for (const img of await section.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          img.evaluate(
            (element) => element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(width);
  }
  const guideBoxes = await guides
    .locator(".article-card")
    .evaluateAll((cards) =>
      cards.map((card) => {
        const box = card.getBoundingClientRect();
        const photo = card.querySelector(".photo").getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          photoHeight: photo.height,
        };
      }),
    );
  assert(
    Math.max(...guideBoxes.map((box) => box.photoHeight)) -
      Math.min(...guideBoxes.map((box) => box.photoHeight)) <
      1,
    `Unequal guide photos at ${width}`,
  );
  for (const box of guideBoxes)
    assert(box.left >= -1 && box.right <= width + 1, `Overflow at ${width}`);
  if (width >= 1280) {
    assert(Math.abs(guideBoxes[0].top - guideBoxes[1].top) < 1);
    assert(Math.abs(guideBoxes[1].top - guideBoxes[2].top) < 1);
    assert(guideBoxes[3].top >= guideBoxes[0].bottom);
  }
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const footerHeight = (await footer.boundingBox()).height;
  if (width === 1920) {
    const before = await sharp("qa/footer-final-1920.png").metadata();
    assert(
      footerHeight < before.height * 0.9,
      "Footer height should reduce noticeably",
    );
  }
  if ([390, 1440, 1920].includes(width)) {
    await services.screenshot({
      path: `qa/home-services-refined-${width}.png`,
      style: screenshotStyle,
    });
    await guides.screenshot({
      path: `qa/home-guides-refined-${width}.png`,
      style: screenshotStyle,
    });
    await footer.screenshot({
      path: `qa/footer-compact-${width}.png`,
      style: screenshotStyle,
    });
  }
  results.push({
    width,
    footerHeight,
    serviceCards: 6,
    guideCards: 6,
    uniqueImages: 12,
  });
}
await page.setViewportSize({ width: 1440, height: 1100 });
await guides.locator(".article-card a").first().click();
await page.waitForURL("**/blog/a-calm-weekly-cleaning-routine");
assert.deepEqual(errors, []);
await browser.close();
await fs.writeFile(
  "qa/home-cards-results.json",
  JSON.stringify({ results, errors }, null, 2),
);
console.log(
  JSON.stringify({ results, guideLinkWorks: true, errors, submissions: 0 }),
);
