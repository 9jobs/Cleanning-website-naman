import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const errors = [],
  consoleErrors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("WebSocket"))
    consoleErrors.push(m.text());
});
const base = "http://127.0.0.1:4317";
await page.goto(base);
await expect(page.locator(".reference-hero h1")).toBeVisible();
await expect(
  page.locator(".reference-hero .motion-reveal").first(),
).toHaveAttribute("data-reveal-state", "visible");
await expect(page.locator(".site-header .logo")).toContainText("cleannora.co");
await page.screenshot({ path: "qa/redesign-desktop-viewport.png" });
const motion = [];
for (const selector of [
  ".reference-intro",
  ".service-showcase",
  ".moving-section",
  ".benefits-section",
  ".journey-section",
  ".story-section",
]) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  const section = page.locator(selector);
  await expect(section.locator(".motion-reveal").first()).toHaveAttribute(
    "data-reveal-state",
    "visible",
  );
  motion.push({ section: selector, revealed: true });
}
await page.locator(".comparison-wrap").scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "Bathroom", exact: true }).click();
await expect(
  page.locator(".comparison-sheet").first().locator("img"),
).toHaveAttribute("src", /bathroom/);
await page
  .getByRole("slider", { name: "Compare before and after cleaning images" })
  .fill("30");
expect(await page.getByRole("slider").inputValue()).toBe("30");
await page.getByRole("button", { name: "Living Room", exact: true }).click();
expect(await page.getByRole("slider").inputValue()).toBe("50");
await page.locator(".experience-carousel").scrollIntoViewIfNeeded();
const previous = await page.locator(".experience-slide blockquote").innerText();
await page.getByRole("button", { name: "Next experience" }).click();
await expect(page.locator(".experience-slide blockquote")).not.toHaveText(
  previous,
);
await expect(page.locator(".experience-top")).toContainText(
  "NOT CUSTOMER TESTIMONIALS",
);
await page.locator(".reference-lead").scrollIntoViewIfNeeded();
await page.locator(".lead-form-fields").getByLabel("First name").fill("Jamie");
await page
  .locator(".lead-form-fields")
  .getByLabel("Email address")
  .fill("jamie@example.com");
await page
  .locator(".lead-form-fields")
  .getByLabel("Phone number")
  .fill("0412345678");
await page.getByRole("button", { name: "Get My Free Quote" }).click();
await expect(
  page.locator(".lead-form-expanded").getByLabel("Full name"),
).toHaveValue("Jamie");
await expect(
  page.locator(".lead-form-expanded").getByLabel("Email", { exact: true }),
).toHaveValue("jamie@example.com");
await page
  .locator(".lead-form-expanded")
  .getByRole("button", { name: "Back to your details" })
  .click();
const responsive = [];
for (const width of [375, 390, 430, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    "/",
    "/about",
    "/services",
    "/pricing",
    "/book",
    "/contact",
    "/careers",
    "/faq",
    "/areas",
    "/reviews",
    "/blog",
    "/privacy",
    "/terms",
    "/services/deep-cleaning",
    "/blog/kitchen-reset-guide",
  ]) {
    await page.goto(base + route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    responsive.push({ width, route, overflow });
    expect(overflow, `${route} at ${width}`).toBe(false);
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(base);
for (
  let y = 0;
  y < (await page.evaluate(() => document.body.scrollHeight));
  y += 650
) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(80);
}
await page.waitForLoadState("networkidle");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "qa/redesign-desktop.png", fullPage: true });
await page.screenshot({ path: "qa/redesign-desktop-viewport.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base);
for (
  let y = 0;
  y < (await page.evaluate(() => document.body.scrollHeight));
  y += 650
) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(80);
}
await page.waitForLoadState("networkidle");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "qa/redesign-mobile.png", fullPage: true });
await page.screenshot({ path: "qa/redesign-mobile-viewport.png" });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(base);
const reduced = await page.locator(".reference-hero h1").evaluate((e) => {
  let p = e;
  while (p && p.tagName !== "BODY") {
    if (Number(getComputedStyle(p).opacity) === 0) return false;
    p = p.parentElement;
  }
  return true;
});
expect(reduced).toBe(true);
expect(errors).toEqual([]);
const unexpected = consoleErrors.filter(
  (e) => !e.includes("status of 404") && !e.includes("status of 503"),
);
expect(unexpected).toEqual([]);
const report = {
  brand: "cleannora.co",
  reference: "https://www.maidtoclean.com.au/",
  motion,
  comparisonCategories: 3,
  carousel: true,
  leadHandoff: true,
  responsive,
  reducedMotion: true,
  pageErrors: errors,
  unexpectedConsoleErrors: unexpected,
};
await fs.writeFile("qa/redesign-report.json", JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    { ...report, responsiveChecks: responsive.length, responsive: undefined },
    null,
    2,
  ),
);
await browser.close();
