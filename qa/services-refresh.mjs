import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1448, height: 1150 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4317");
const section = page.locator(".service-showcase");
await section.scrollIntoViewIfNeeded();
await expect(section.locator(".service-tile")).toHaveCount(6);
await expect
  .poll(() =>
    section
      .locator(".service-tile img")
      .evaluateAll((els) => els.every((i) => i.complete && i.naturalWidth > 0)),
  )
  .toBe(true);
const placement = await section.locator(".service-tile").evaluateAll((els) =>
  els.map((el) => {
    const s = getComputedStyle(el);
    return [s.gridColumn, s.gridRow];
  }),
);
expect(placement[0]).toEqual(["1", "1 / 4"]);
expect(placement[5]).toEqual(["2 / 4", "3"]);
await section.screenshot({ path: "qa/services-premium-desktop.png" });
for (const width of [375, 390, 430, 768, 1024, 1448, 1920]) {
  await page.setViewportSize({ width, height: 950 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `overflow at ${width}`,
  ).toBe(true);
  for (const card of await section.locator(".service-tile").all()) {
    const fits = await card.evaluate((el) => {
      const box = el.getBoundingClientRect(),
        copy = el.querySelector(".service-tile-copy").getBoundingClientRect();
      return (
        copy.top >= box.top &&
        copy.bottom <= box.bottom + 1 &&
        copy.left >= box.left &&
        copy.right <= box.right
      );
    });
    expect(fits, `text fits at ${width}`).toBe(true);
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await section.screenshot({ path: "qa/services-premium-mobile.png" });
await section.locator(".service-tile").nth(1).getByRole("link").click();
await expect(page).toHaveURL(/services\/deep-cleaning/);
expect(errors).toEqual([]);
console.log(
  "PASS all six photos, desktop mosaic, 7 viewport widths, text bounds and service navigation.",
);
await browser.close();
