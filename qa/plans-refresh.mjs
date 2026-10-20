import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1672, height: 1100 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4317");
const section = page.locator(".reference-packages");
await section.scrollIntoViewIfNeeded();
await expect(section.locator(".pricing-path")).toHaveCount(3);
await expect(section.locator(".path-service-icon")).toHaveCount(3);
await expect(section.locator(".path-price")).toHaveCount(0);
await expect(section.locator(".path-featured-badge")).toBeVisible();
const links = await section
  .locator("a.button")
  .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
expect(links).toEqual([
  "/pricing?service=regular-house-cleaning",
  "/pricing?service=one-off-cleaning",
  "/pricing?service=end-of-lease-cleaning",
]);
await section.screenshot({ path: "qa/plans-premium-desktop.png" });
for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 950 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `overflow at ${width}`,
  ).toBe(true);
  const boxes = await section.locator(".pricing-path").evaluateAll((els) =>
    els.map((el) => {
      const box = el.getBoundingClientRect();
      return [...el.querySelectorAll("h3, p, ul, a.button")].every((child) => {
        const bounds = child.getBoundingClientRect();
        return bounds.left >= box.left && bounds.right <= box.right + 1;
      });
    }),
  );
  for (const inside of boxes)
    expect(inside, `card content at ${width}`).toBe(true);
}
await page.setViewportSize({ width: 390, height: 844 });
await section.screenshot({ path: "qa/plans-premium-mobile.png" });
await section
  .getByRole("link", { name: "Build this cleaning plan" })
  .nth(1)
  .click();
await expect(page).toHaveURL(/pricing\?service=one-off-cleaning/);
expect(errors).toEqual([]);
console.log(
  "PASS 3 plan links, featured card, icons, 7 responsive widths and pricing navigation.",
);
await browser.close();
