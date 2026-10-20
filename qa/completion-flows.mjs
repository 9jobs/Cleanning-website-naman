import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const base = "http://127.0.0.1:4317";
const p = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [],
  consoleErrors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("WebSocket"))
    consoleErrors.push(m.text());
});
const report = {
  routes: [],
  responsive: [],
  checks: [],
  errors,
  consoleErrors,
};
for (const route of [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/areas",
  "/reviews",
  "/faq",
  "/contact",
  "/book",
  "/careers",
  "/blog",
  "/privacy",
  "/terms",
  "/quote",
  "/services/regular-house-cleaning",
  "/services/one-off-cleaning",
  "/services/deep-cleaning",
  "/services/end-of-lease-cleaning",
  "/services/residential-cleaning",
  "/services/commercial-cleaning",
  "/services/office-cleaning",
  "/services/airbnb-cleaning",
  "/services/carpet-cleaning",
  "/services/window-cleaning",
  "/services/oven-cleaning",
  "/blog/a-calm-weekly-cleaning-routine",
  "/blog/moving-out-cleaning-checklist",
  "/blog/kitchen-reset-guide",
  "/book/confirmation",
  "/quote/confirmation",
]) {
  const res = await p.goto(base + route);
  expect(res.status()).toBe(200);
  await expect(p.locator("h1")).toBeVisible();
  report.routes.push({ route, status: res.status() });
}
await p.goto(base + "/missing-page");
await expect(p.locator("h1")).toHaveText("Looking for a clean start?");
report.checks.push("custom 404");
await p.goto(base + "/services");
await p.getByRole("button", { name: "Commercial", exact: true }).click();
expect(await p.locator(".finish-service-card").count()).toBe(3);
report.checks.push("service filter");
await p.goto(base + "/faq");
await p.getByRole("textbox", { name: "Search questions" }).fill("carpet");
expect(await p.locator(".finish-accordion details").count()).toBeGreaterThan(0);
for (const result of await p.locator(".finish-accordion details").all()) await expect(result).toContainText(/carpet/i);
await p.locator(".finish-accordion summary").first().click();
await expect(p.locator(".finish-accordion p").first()).toBeVisible();
report.checks.push("FAQ search and accordion");
await p.goto(base + "/areas");
await p.getByRole("textbox", { name: "Your suburb or postcode" }).fill("3000");
await p.getByRole("button", { name: "Check availability" }).click();
await expect(p.locator(".finish-location-status")).toContainText("confirm coverage");
report.checks.push("honest area lookup");
await p.goto(base + "/services/deep-cleaning");
await p.locator('.completion').getByRole('link',{name:'Build your service enquiry',exact:true}).click();
await expect(p.locator('select[name="service"]')).toHaveValue('deep-cleaning');
expect(p.url()).toContain('service=deep-cleaning');
report.checks.push('service-to-quote handoff');
await p.goto(base + "/book");
await expect(p.locator(".finish-dev-note")).toContainText("not connected");
await p.getByRole("button", { name: "Continue", exact: true }).click();
await expect(p.locator(".booking-panel h2")).toContainText("property");
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
await expect(p.getByText("Choose a date", { exact: true })).toBeVisible();
await p.getByLabel("Preferred date").fill("2099-12-10");
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
await expect(
  p.getByText("Enter your first name", { exact: true }),
).toBeVisible();
await p.getByLabel(/^First name/).fill("Jamie");
await p.getByLabel(/^Last name/).fill("Taylor");
await p.getByLabel(/^Email/).fill("jamie@example.com");
await p.getByLabel("Australian phone number").fill("0412345678");
await p.getByLabel("Street address").fill("10 Example Street");
await p.getByLabel(/^Suburb/).fill("Melbourne");
await p.getByLabel(/^Postcode/).fill("3000");
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p.getByRole("checkbox").check();
const responsePromise = p.waitForResponse((r) =>
  r.url().endsWith("/api/submissions"),
);
await p.getByRole("button", { name: "Submit Cleaning Request" }).click();
const result = await responsePromise;
expect(result.status()).toBe(503);
await expect(p.locator(".notice.error")).toContainText("not been received");
expect(p.url()).not.toContain("confirmation");
report.checks.push(
  "six-step booking, validation and truthful unconfigured failure",
);
await p.reload();
await p.getByRole("button", { name: "Restore plan" }).click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
report.checks.push("local plan restoration");
await p.goto(base + "/contact");
await p.getByRole("button", { name: "Submit Cleaning Enquiry" }).click();
await expect(p.getByText("Enter your name", { exact: true })).toBeVisible();
report.checks.push("contact validation");
await p.goto(base + "/");
await p.locator(".mega summary").click();
await expect(p.locator(".mega-panel")).toBeVisible();
await p.locator(".mega summary").press("Escape");
await expect(p.locator(".mega-panel")).not.toBeVisible();
report.checks.push("keyboard services menu");
for (const width of [375, 390, 430, 768, 1024, 1280, 1440]) {
  await p.setViewportSize({ width, height: 900 });
  for (const route of ["/", "/pricing", "/book", "/contact", "/services"]) {
    await p.goto(base + route);
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    report.responsive.push({ width, route, overflow });
    expect(overflow, `${route} at ${width}px`).toBe(false);
  }
}
await p.setViewportSize({ width: 390, height: 844 });
await p.goto(base + "/");
await p.getByRole("button", { name: "Open navigation" }).click();
await expect(p.locator("#mobile-nav")).toBeVisible();
await p
  .locator("#mobile-nav")
  .getByRole("link", { name: "Pricing", exact: true })
  .click();
await expect(p.locator("#mobile-nav")).not.toBeVisible();
await p.waitForURL("**/pricing");
await expect(p.locator("h1:visible")).toContainText("Choose a cleaning plan");
report.checks.push("mobile navigation");
await p.goto(base + "/");
for (
  let y = 0;
  y < (await p.evaluate(() => document.body.scrollHeight));
  y += 700
) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(80);
}
await p.waitForLoadState("networkidle");
await p.evaluate(() => window.scrollTo(0, 0));
await p.screenshot({ path: "qa/completion/final-home-mobile.png", fullPage: true });
await p.screenshot({ path: "qa/completion/final-mobile-viewport.png" });
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto(base + "/");
for (
  let y = 0;
  y < (await p.evaluate(() => document.body.scrollHeight));
  y += 800
) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(60);
}
await p.waitForLoadState("networkidle");
await p.evaluate(() => window.scrollTo(0, 0));
await p.screenshot({ path: "qa/completion/final-home-desktop.png", fullPage: true });
await p.screenshot({ path: "qa/completion/final-desktop-viewport.png" });
await expect
  .poll(
    () =>
      p
        .locator("img")
        .evaluateAll((imgs) =>
          imgs.every((i) => i.complete && i.naturalWidth > 0),
        ),
    { timeout: 15000 },
  )
  .toBe(true);
const images = await p.locator("img").evaluateAll((imgs) =>
  imgs.map((i) => ({
    src: i.getAttribute("src"),
    loaded: i.complete && i.naturalWidth > 0,
  })),
);
report.images = images;
expect(images.every((i) => i.loaded)).toBe(true);
await fs.writeFile("qa/completion/flows-report.json", JSON.stringify(report, null, 2));
expect(errors).toEqual([]);
const unexpectedConsoleErrors = consoleErrors.filter(
  (e) =>
    !e.includes(
      "Failed to load resource: the server responded with a status of 503",
    ) &&
    !e.includes(
      "Failed to load resource: the server responded with a status of 404",
    ),
);
expect(unexpectedConsoleErrors).toEqual([]);
console.log(
  JSON.stringify(
    {
      routes: report.routes.length,
      responsiveChecks: report.responsive.length,
      checks: report.checks,
      images: report.images.length,
      pageErrors: errors.length,
      unexpectedConsoleErrors: unexpectedConsoleErrors.length,
    },
    null,
    2,
  ),
);
await browser.close();
