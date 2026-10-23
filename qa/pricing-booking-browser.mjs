import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
async function pickAppointment(dialog) {
  await dialog.getByLabel("Preferred date", { exact: false }).click();
  const calendar = dialog.getByRole("dialog", {
    name: "Choose your preferred cleaning date",
  });
  await calendar.getByRole("button", { name: "Next month" }).click();
  await calendar.locator("button[data-date]:not(:disabled)").first().click();
  await dialog.getByLabel("Preferred time", { exact: false }).click();
  await dialog.getByLabel("Hour", { exact: true }).selectOption("09");
  await dialog.getByLabel("Minute", { exact: true }).selectOption("30");
  await dialog.getByRole("button", { name: "Set time", exact: true }).click();
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const requests = [];
  let mode = "fail";
  await page.route("**/api/pricing/checkout", async (route) => {
    requests.push(route.request().postDataJSON());
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({
      status: mode === "fail" ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        mode === "fail"
          ? { error: "Mock checkout unavailable. Please retry." }
          : { url: "https://checkout.stripe.com/c/pay/cs_test_BROWSER" },
      ),
    });
  });
  await page.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Mock Stripe Checkout</h1>",
    }),
  );
  await page.goto("http://localhost:4317/pricing", {
    waitUntil: "networkidle",
  });
  const serviceSlugs = [
    "house-cleaning",
    "one-off-cleaning",
    "property-cleaning",
  ];
  for (let index = 0; index < 3; index++) {
    const trigger = page
      .getByRole("link", { name: "Book Now", exact: true })
      .nth(index);
    await trigger.click();
    const dialog = page.locator(
      'dialog[aria-labelledby="pricing-booking-title"]',
    );
    await dialog.waitFor();
    assert.equal(await dialog.locator("input[required]").count(), 6);
    assert.equal(await page.locator(":focus").getAttribute("name"), "name");
    const before = requests.length;
    await dialog.getByRole("button", { name: "Pay Now", exact: true }).click();
    assert.equal(requests.length, before);
    await dialog.getByLabel("Full name").fill("Browser Test Customer");
    await dialog.getByLabel("Email address").fill("customer@example.invalid");
    await dialog.getByLabel("Phone number").fill("0412345678");
    await dialog
      .getByLabel("Cleaning address")
      .fill("1 Example Street, Melbourne VIC 3000");
    await pickAppointment(dialog);
    if (index === 0) {
      await dialog.screenshot({ path: "qa/pricing-booking-desktop.png" });
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 850 });
        await page.evaluate(
          () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r)),
            ),
        );
        assert.ok(
          await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
          `dialog overflow ${width}`,
        );
        const box = await dialog.boundingBox();
        assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1);
        if (width === 390)
          await dialog.screenshot({ path: "qa/pricing-booking-mobile.png" });
      }
      await page.setViewportSize({ width: 1440, height: 1050 });
    }
    await dialog.getByRole("button", { name: "Pay Now", exact: true }).click();
    await dialog
      .getByRole("alert")
      .filter({ hasText: "Mock checkout unavailable" })
      .waitFor();
    assert.equal(requests.length, before + 1);
    assert.equal(requests.at(-1).service, serviceSlugs[index]);
    assert.equal(requests.at(-1).booking.time, "09:30");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    assert.equal(
      await trigger.evaluate((e) => e === document.activeElement),
      true,
    );
  }
  await page
    .getByRole("link", { name: "Book Now", exact: true })
    .first()
    .click();
  const dialog = page.locator(
    'dialog[aria-labelledby="pricing-booking-title"]',
  );
  await dialog.getByLabel("Full name").fill("Browser Test Customer");
  await dialog.getByLabel("Email address").fill("customer@example.invalid");
  await dialog.getByLabel("Phone number").fill("0412345678");
  await dialog
    .getByLabel("Cleaning address")
    .fill("1 Example Street, Melbourne VIC 3000");
  await pickAppointment(dialog);
  mode = "success";
  await dialog.getByRole("button", { name: "Pay Now", exact: true }).click();
  await page.waitForURL("https://checkout.stripe.com/**");
  assert.equal(
    await page.getByRole("heading", { name: "Mock Stripe Checkout" }).count(),
    1,
  );
  console.log(
    "Browser checks passed: all three booking cards, six required fields, selected service/details payload, failure/retry, native modal focus/Escape, responsive sizes and mocked Stripe redirect. No real payment or enquiry submitted.",
  );
} finally {
  await browser.close();
}
