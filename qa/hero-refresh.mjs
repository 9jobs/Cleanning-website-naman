import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1624, height: 850 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4317");
await expect(page.locator(".reference-hero h1")).toBeVisible();
await page.screenshot({ path: "qa/hero-refined-desktop.png" });
for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 950 });
  await expect(page.locator(".reference-hero h1")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow, `overflow at ${width}`).toBe(false);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "qa/hero-refined-mobile.png", fullPage: false });
const form = page.locator(".lead-form-fields");
await form.getByLabel("First name").fill("Naman");
await form.getByLabel("Email address").fill("naman@example.com");
await form.getByLabel("Phone number").fill("0412345678");
await form.getByRole("button", { name: "Get My Free Quote" }).click();
await expect(
  page.locator('.lead-form-expanded input[name="name"]'),
).toHaveValue("Naman");
await expect(
  page.locator('.lead-form-expanded input[name="email"]'),
).toHaveValue("naman@example.com");
expect(errors).toEqual([]);
console.log(
  "PASS: hero at 7 viewport widths, quote handoff, no browser errors.",
);
await browser.close();
