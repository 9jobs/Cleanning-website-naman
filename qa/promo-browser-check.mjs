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
await page
  .getByRole("button", {
    name: "Claim your 10% off first residential clean offer",
  })
  .click();
const dialog = page.getByRole("dialog");
await dialog.waitFor({ state: "visible" });
await page.getByRole("button", { name: "Close promotional offer" }).focus();
await page.keyboard.press("Shift+Tab");
assert.equal(
  await dialog.evaluate((element) => element.contains(document.activeElement)),
  true,
);
for (let index = 0; index < 16; index++) {
  await page.keyboard.press("Tab");
  assert.equal(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
    true,
  );
}
await page.getByRole("button", { name: "Copy Code", exact: true }).click();
assert.equal(
  await page.evaluate(() => navigator.clipboard.readText()),
  "CLEAN10",
);
await page.keyboard.press("Escape");
assert.equal(await dialog.count(), 0);
assert.equal(
  await page
    .getByRole("button", {
      name: "Claim your 10% off first residential clean offer",
    })
    .evaluate((el) => el === document.activeElement),
  true,
);
for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 850 });
  await page
    .getByRole("button", {
      name: "Claim your 10% off first residential clean offer",
    })
    .click();
  await dialog.waitFor({ state: "visible" });
  await page.waitForTimeout(300);
  assert.equal(
    await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    true,
    `modal overflow ${width}`,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    `page overflow ${width}`,
  );
  await page.screenshot({ path: `qa/promo-${width}.png` });
  await page.getByRole("button", { name: "Close promotional offer" }).click();
}
await page
  .getByRole("button", {
    name: "Claim your 10% off first residential clean offer",
  })
  .click();
await page.getByRole("button", { name: "Claim My 10% OFF" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "highlighted fields" })
  .waitFor();
let requests = 0;
let failSubmission = true;
await page.route("**/api/promo", async (route) => {
  const data = route.request().postDataJSON();
  requests++;
  if (data.action === "verify")
    return route.fulfill({
      json:
        data.code.trim().toUpperCase() === "CLEAN10"
          ? { recognised: true }
          : {
              error:
                "That promo code isn't valid. Please check it and try again.",
            },
      status: data.code.trim().toUpperCase() === "CLEAN10" ? 200 : 400,
    });
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (failSubmission)
    return route.fulfill({
      status: 502,
      json: { error: "Test delivery failure. Please retry." },
    });
  return route.fulfill({ json: { accepted: true } });
});
await dialog.getByLabel("Promo Code", { exact: false }).fill("WRONG");
await dialog.getByRole("button", { name: "Apply", exact: true }).click();
await page
  .getByText("That promo code isn't valid.", { exact: false })
  .waitFor();
await dialog.getByLabel("Promo Code", { exact: false }).fill(" clean10 ");
await dialog.getByRole("button", { name: "Apply", exact: true }).click();
await page.getByText("Promo code recognised!", { exact: false }).waitFor();
await dialog.getByLabel("Full Name", { exact: false }).fill("QA Test");
await dialog
  .getByLabel("Email Address", { exact: false })
  .fill("qa@example.com");
await dialog.getByLabel("Phone Number", { exact: false }).fill("0412345678");
await page.getByRole("button", { name: "Claim My 10% OFF" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "Test delivery failure" })
  .waitFor();
failSubmission = false;
await page.getByRole("button", { name: "Claim My 10% OFF" }).dblclick();
await page.getByText("Your 10% Offer Request Is In!").waitFor();
assert.equal(requests, 4);
for (const width of [320, 390, 640, 768, 1440]) {
  await page.setViewportSize({ width, height: 850 });
  await page.waitForTimeout(200);
  assert.equal(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
    true,
    `success overflow ${width}`,
  );
  await page.screenshot({ path: `qa/promo-success-${width}.png` });
}
await page.getByRole("button", { name: "Back to Home", exact: true }).click();
await page.emulateMedia({ reducedMotion: "reduce" });
assert.equal(
  await page
    .locator('[class*="first-clean-offer"][class*="track"]')
    .evaluate((el) => getComputedStyle(el).animationName),
  "none",
);
assert.equal(
  await page.getByRole("button", { name: "Dismiss first clean offer" }).count(),
  0,
);
assert.equal(await page.getByRole("dialog").count(), 0);
assert.equal(
  await page
    .getByRole("button", {
      name: "Claim your 10% off first residential clean offer",
    })
    .count(),
  1,
);
assert.deepEqual(errors, []);
console.log(
  "Browser QA passed: persistent banner, clipboard, required fields, code/final response mocks, duplicate-click prevention, success, Escape/focus return, reduced motion and 320/390/768/1440px overflow checks. No real enquiries sent.",
);
await browser.close();
