import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4317/", { waitUntil: "networkidle" });
const form = page.getByRole("form", { name: "Quick cleaning quote" });
for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 850 });
  await form.getByLabel("Cleaning service", { exact: false }).waitFor();
  assert.equal(await form.locator("select option").count(), 6);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    `page overflow ${width}`,
  );
  assert.equal(
    await form.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    true,
    `form overflow ${width}`,
  );
  await form.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `qa/quick-quote-inline-${width}.png` });
  await form
    .getByRole("button", { name: "Get Promo Code", exact: false })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  assert.equal(
    await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    true,
    `popup overflow ${width}`,
  );
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  assert.equal(await page.getByRole("dialog").count(), 0);
}
await page.setViewportSize({ width: 1440, height: 850 });
let submitted = 0;
let fail = true;
await page.route("**/api/quick-quote", () => {
  throw new Error("Legacy quote endpoint should not be used by promo form");
});
await page.route("**/api/promo", async (route) => {
  const data = route.request().postDataJSON();
  if (data.action === "verify")
    return route.fulfill({
      status: data.code.trim().toUpperCase() === "CLEAN10" ? 200 : 400,
      json:
        data.code.trim().toUpperCase() === "CLEAN10"
          ? { recognised: true }
          : { error: "That promo code is not valid." },
    });
  submitted++;
  assert.equal(data.service, "house-cleaning");
  assert.equal(data.code, "CLEAN10");
  await new Promise((resolve) => setTimeout(resolve, 250));
  return route.fulfill({
    status: fail ? 502 : 200,
    json: fail
      ? { error: "Mock delivery failed. Please retry." }
      : { accepted: true },
  });
});
await form.getByRole("button", { name: "Get My 10% Off Quote" }).click();
assert.equal(await form.locator('[aria-invalid="true"]').count(), 5);
await form.getByLabel("Full name", { exact: false }).fill("QA Visitor");
await form.getByLabel("Email address", { exact: false }).fill("qa@example.com");
await form.getByLabel("Phone number", { exact: false }).fill("0412345678");
await form
  .getByLabel("Cleaning service", { exact: false })
  .selectOption("house-cleaning");
await form
  .getByRole("button", { name: "Get Promo Code", exact: false })
  .click();
const dialog = page.getByRole("dialog");
await dialog.getByRole("button", { name: "Copy Code", exact: true }).click();
assert.equal(
  await page.evaluate(() => navigator.clipboard.readText()),
  "CLEAN10",
);
await dialog.getByRole("button", { name: "Got It", exact: true }).click();
assert.equal(await dialog.count(), 0);
assert.equal(
  await form.getByLabel("Promo code", { exact: false }).inputValue(),
  "CLEAN10",
);
await form.getByRole("button", { name: "Get My 10% Off Quote" }).click();
await form.getByText("Please click Apply", { exact: false }).waitFor();
assert.equal(submitted, 0);
await form.getByLabel("Promo code", { exact: false }).fill("WRONG");
await form.getByRole("button", { name: "Apply Now", exact: true }).click();
await form.getByText("That promo code is not valid.").waitFor();
await form.getByLabel("Promo code", { exact: false }).fill(" clean10 ");
await form.getByRole("button", { name: "Apply Now", exact: true }).click();
await form.getByText("Promo code applied!", { exact: true }).waitFor();
await form.getByRole("button", { name: "Get My 10% Off Quote" }).click();
await form
  .getByRole("alert")
  .filter({ hasText: "Mock delivery failed" })
  .waitFor();
assert.equal(await dialog.count(), 0);
fail = false;
await form.getByRole("button", { name: "Get My 10% Off Quote" }).dblclick();
await dialog.getByText("Your 10% Offer Request Is In!").waitFor();
assert.equal(submitted, 2);
await page.screenshot({ path: "qa/quick-quote-inline-success.png" });
await dialog.getByRole("button", { name: "Close", exact: true }).click();
assert.equal(await dialog.count(), 0);
assert.equal(await form.isVisible(), true);
assert.deepEqual(errors, []);
console.log(
  "Inline quick quote QA passed: fields visible on the actual card, only 5 website services, responsive 320/390/768/1024/1440/1920px, code copy/Got It, invalid code, Apply, required fields, mocked mail failure/retry, duplicate clicks, success popup and close. No real enquiries sent.",
);
await browser.close();
