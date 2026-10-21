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
page.on("pageerror", (e) => errors.push(e.message));
let payload;
await page.route("**/api/quick-quote", async (route) => {
  payload = route.request().postDataJSON();
  await route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({
      error: "Local verification: request intercepted; no email sent.",
    }),
  });
});
await page.goto("http://localhost:4317");
await page.evaluate(() => document.fonts.ready);
const form = page.getByRole("form", { name: "Quick cleaning quote" });
await form
  .getByLabel("First name", { exact: true })
  .fill("Local Phone Verification");
await form
  .getByLabel("Email address", { exact: true })
  .fill("local-check@example.com");
await form.getByLabel("Phone number", { exact: true }).fill("+61 422 279 428");
await form.getByRole("button", { name: "Get My Free Quote" }).click();
await expect(page.locator(".hero-enquiry [role=alert]")).toContainText(
  "Local verification",
);
assert.equal(payload.phone, "+61 422 279 428");
assert.equal(payload.name, "Local Phone Verification");
assert(payload.submissionId);
await page.locator(".journey-section").scrollIntoViewIfNeeded();
await page
  .locator(".journey-section")
  .screenshot({
    path: "qa/journey-centered-final.png",
    style: ".site-header,.back-to-top{visibility:hidden!important}",
  });
const checks = [];
for (const width of [1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator(".mega summary").click();
  const panel = page.locator(".mega-panel");
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  assert(Math.abs(box.width - width * 0.5) < 2);
  assert(Math.abs(box.x - width * 0.25) < 2);
  assert.equal(await panel.locator("a").count(), 11);
  await expect(panel).not.toContainText(
    "Professional cleaning for every space",
  );
  await page.screenshot({ path: `qa/services-menu-centered-${width}.png` });
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  checks.push({ width, menuWidth: box.width, menuLeft: box.x });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.locator(".journey-section").scrollIntoViewIfNeeded();
await page
  .locator(".journey-section")
  .screenshot({
    path: "qa/journey-centered-mobile.png",
    style: ".site-header,.back-to-top{visibility:hidden!important}",
  });
assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  JSON.stringify({
    submittedPhone: payload.phone,
    realSubmissions: 0,
    desktopMenuChecks: checks,
    noConsoleErrors: true,
    mobileNoOverflow: true,
  }),
);
