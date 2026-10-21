import assert from "node:assert/strict";
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
await expect(page.locator(".service-tile")).toHaveCount(6);
await expect(page.locator(".journal-section .article-card")).toHaveCount(6);
const footer = page.locator("footer");
await expect(
  footer.getByRole("heading", { name: "Social Links", exact: true }),
).toBeVisible();
await expect(footer.getByText("Discover", { exact: true })).toHaveCount(0);
await expect(footer.getByText("Follow us", { exact: true })).toHaveCount(0);
for (const label of ["Facebook", "Instagram", "LinkedIn", "YouTube"])
  await expect(footer.getByText(label, { exact: true })).toBeVisible();
assert.equal(await footer.locator('a[href="#"]').count(), 0);
const screenshotStyle =
  ".site-header,.skip-link,.back-top,nextjs-portal,[class*=scroll-progress]{visibility:hidden!important}";
let comparisons = 0;
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.locator(".service-showcase").scrollIntoViewIfNeeded();
  const serviceImages = await page
    .locator(".service-tile img")
    .evaluateAll((images) =>
      images.map((image) =>
        new URL(image.currentSrc || image.src, location.href).searchParams.get(
          "url",
        ),
      ),
    );
  assert(
    serviceImages.every((src) => src.includes("/images/service-preview-")),
  );
  assert.equal(new Set(serviceImages).size, 6);
  const comparison = page.locator(".comparison-wrap");
  for (const category of ["Property", "Garden", "Construction"]) {
    await comparison
      .getByRole("button", { name: category, exact: true })
      .click();
    const range = comparison.getByRole("slider");
    await expect(range).toHaveValue("50");
    const images = comparison.locator("img");
    for (const img of await images.all()) {
      await expect
        .poll(() =>
          img.evaluate(
            (element) => element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await expect(images.first()).toHaveAttribute(
      "src",
      new RegExp(`comparison-${category.toLowerCase()}-before-v3`),
    );
    await expect(images.last()).toHaveAttribute(
      "src",
      new RegExp(
        `comparison-${category.toLowerCase()}-after-v${category === "Construction" ? "4" : "3"}`,
      ),
    );
    await range.focus();
    await page.keyboard.press("Home");
    await expect(range).toHaveValue("0");
    await page.keyboard.press("End");
    await expect(range).toHaveValue("100");
    await range.fill("50");
    assert(
      (
        await comparison.locator(".comparison-after").getAttribute("style")
      ).includes("50%"),
    );
    if ([390, 1440].includes(width))
      await comparison.screenshot({
        path: `qa/comparison-${category.toLowerCase()}-refined-${width}.png`,
        style: screenshotStyle,
      });
    comparisons++;
  }
  await footer.scrollIntoViewIfNeeded();
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth),
    width,
    `Overflow at ${width}`,
  );
  const overflowing = await footer.evaluate((element) =>
    [...element.querySelectorAll("a, p, h2, li")]
      .filter((child) => {
        const rect = child.getBoundingClientRect();
        return rect.left < -1 || rect.right > innerWidth + 1;
      })
      .map((child) => child.textContent),
  );
  assert.deepEqual(overflowing, []);
  if ([390, 1440, 1920].includes(width)) {
    await footer.screenshot({
      path: `qa/footer-social-column-${width}.png`,
      style: screenshotStyle,
    });
    await page
      .locator(".service-showcase")
      .screenshot({
        path: `qa/service-new-tasks-${width}.png`,
        style: screenshotStyle,
      });
  }
}
assert.deepEqual(errors, []);
await browser.close();
console.log(
  JSON.stringify({
    viewportWidths: 8,
    serviceCards: 6,
    comparisonsChecked: comparisons,
    keyboardSliderAndTabReset: true,
    socialColumn: true,
    discoverAndFollowRemoved: true,
    submissions: 0,
    errors,
  }),
);
