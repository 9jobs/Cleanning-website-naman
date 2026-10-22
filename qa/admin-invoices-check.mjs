import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const base = "http://localhost:4317";
const capabilities = await (await fetch(base + "/api/admin/invoices")).json();
if (capabilities.stripeTestReady) {
  console.log(
    "Preview-only QA skipped: Thrive4 Stripe test mode is enabled. Use node qa/admin-stripe-check.mjs for the paid checkout checks.",
  );
  process.exit(0);
}

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
let id;
let sendAttempts = 0;
const sendKeys = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", (dialog) => dialog.accept());
await page.route("**/api/admin/invoices", async (route) => {
  if (
    route.request().method() === "POST" &&
    route.request().postDataJSON()?.action === "send"
  ) {
    sendAttempts++;
    const payload = route.request().postDataJSON();
    assert.match(payload.requestId, /^[a-f0-9-]{36}$/);
    assert.equal(payload.resend, sendAttempts > 1);
    sendKeys.push(payload.requestId);
    const original = await (
      await page.request.get(base + "/api/admin/invoices?id=" + payload.id)
    ).json();
    original.invoice.emailedRevision = original.invoice.revision;
    original.invoice.emailAcceptedAt = new Date().toISOString();
    original.invoice.emailRecipient = original.invoice.email;
    original.invoice.emailMessageId = "<browser-test@example.test>";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(original),
    });
  } else await route.continue();
});
try {
  await page.goto(base + "/admin", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "A fresh invoice. In minutes." }),
  ).toBeVisible();
  await expect(page.locator(".site-header, .site-footer")).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .frameLocator("#email-preview")
        .locator(".invoice-logo")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Weekly", exact: true }).click();
  await page.getByLabel("Client name").fill("Invoice Preview Customer");
  await page.getByLabel("Client email").fill("invoice-preview@example.com");
  await page.getByLabel("Phone number").fill("0412345678");
  await page
    .getByLabel("Billing address")
    .fill("10 Example Street, Melbourne VIC 3000");
  await page.getByLabel(/^Hours worked/).fill("2.5");
  await page.getByLabel("Hourly rate (AUD)").fill("80");
  await expect(page.getByLabel("Total amount (AUD)")).toHaveValue("200.00");
  await expect(page.getByLabel("Total amount (AUD)")).toHaveAttribute(
    "readonly",
    "",
  );
  await page.getByLabel("Autopay preference").check();
  const invoiceDateButton = page.getByRole("button", { name: /^Invoice date/ });
  await invoiceDateButton.click();
  const calendar = page.locator("#invoice-calendar");
  await expect(calendar).toBeVisible();
  await calendar
    .getByLabel("Calendar month", { exact: true })
    .selectOption("9");
  await calendar
    .getByLabel("Calendar year", { exact: true })
    .selectOption("2026");
  await calendar
    .getByRole("button", { name: "23 October 2026", exact: true })
    .click();
  await expect(invoiceDateButton).toContainText("23/10/2026");
  await invoiceDateButton.click();
  await calendar
    .getByRole("button", { name: "23 October 2026", exact: true })
    .press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(invoiceDateButton).toContainText("24/10/2026");
  await invoiceDateButton.click();
  await page
    .locator("#invoice-calendar")
    .screenshot({ path: "qa/admin-calendar-desktop.png" });
  await page.keyboard.press("Escape");
  await invoiceDateButton.click();
  await calendar.getByRole("button", { name: "Today", exact: true }).click();
  const number = "T4-QA-" + Date.now();
  await page.getByLabel("Invoice number").fill(number);
  await expect(
    page.frameLocator("#email-preview").locator("body"),
  ).toContainText("Invoice Preview Customer");
  await expect(
    page.frameLocator("#email-preview").locator("body"),
  ).toContainText("$200.00");
  await expect(
    page.frameLocator("#email-preview").locator("body"),
  ).toContainText("2.5 hrs");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "qa/admin-create-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create Invoice", exact: true })
    .click();
  await page.waitForURL(/\/admin\/review\?id=/);
  id = new URL(page.url()).searchParams.get("id");
  const saved = await (
    await page.request.get(base + "/api/admin/invoices?id=" + id)
  ).json();
  assert.equal(saved.invoice.hours, 2.5);
  assert.equal(saved.invoice.hourlyRate, 80);
  assert.equal(saved.invoice.amount, 200);
  const tampered = await page.request.post(base + "/api/admin/invoices", {
    headers: { origin: base },
    data: {
      action: "save",
      data: { ...saved.invoice, amount: 1 },
      id,
      revision: 1,
    },
  });
  assert.equal(tampered.status(), 400);
  await expect(
    page.getByRole("heading", { name: number, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send via Email", exact: true }),
  ).toBeDisabled();
  const beforeLink = await page.request.post(base + "/api/admin/invoices", {
    headers: { origin: base },
    data: { action: "send", id, revision: 1, confirm: true },
  });
  assert.equal(beforeLink.status(), 400);
  await page
    .getByRole("button", { name: "Generate Payment Link", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Payment Link", exact: true }),
  ).toBeVisible();
  const firstLink = await page.getByLabel("Payment preview link").inputValue();
  assert(firstLink.startsWith(base + "/admin/pay/"));
  await expect(
    page.frameLocator("#email-preview").getByRole("link", { name: /Pay Now/ }),
  ).toHaveCount(0);
  await expect(
    page.frameLocator("#email-preview").locator("body"),
  ).toContainText("Online payment is not enabled yet");
  await page
    .getByRole("button", { name: "Send via Email", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "invoice-preview@example.com",
  );
  await expect(page.getByRole("dialog")).toContainText("test invoice");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page
    .getByRole("button", { name: "Send via Email", exact: true })
    .click();
  await page.getByRole("button", { name: /^Send invoice email/ }).click();
  await expect(
    page.getByRole("button", { name: "Resend via Email", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".sent-notice")).toContainText(
    "<browser-test@example.test>",
  );
  await page
    .getByRole("button", { name: "Resend via Email", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Resend this invoice?");
  await page.getByRole("button", { name: /^Resend invoice email/ }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "qa/admin-review-desktop.png",
    fullPage: true,
  });
  const payment = await browser.newPage({
    viewport: { width: 500, height: 900 },
  });
  await payment.goto(firstLink, { waitUntil: "networkidle" });
  await expect(
    payment.getByRole("heading", { name: "Your invoice is ready." }),
  ).toBeVisible();
  await expect(
    payment.getByRole("button", { name: "Payments unavailable" }),
  ).toBeDisabled();
  await payment.screenshot({
    path: "qa/admin-payment-preview.png",
    fullPage: true,
  });
  await payment.close();
  await page.getByRole("link", { name: "Edit invoice", exact: true }).click();
  await expect(page.getByLabel("Total amount (AUD)")).toHaveValue("200.00");
  await page.getByLabel(/^Hours worked/).fill("3");
  await expect(page.getByLabel("Total amount (AUD)")).toHaveValue("240.00");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.waitForURL(/\/admin\/review\?id=/);
  await expect(
    page.getByRole("button", { name: "Generate Payment Link", exact: true }),
  ).toBeVisible();
  assert.equal((await page.request.get(firstLink)).status(), 404);
  await page
    .getByRole("button", { name: "Generate Payment Link", exact: true })
    .click();
  const secondLink = await page.getByLabel("Payment preview link").inputValue();
  assert.notEqual(secondLink, firstLink);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByLabel("Payment preview link")).toHaveValue(secondLink);
  await expect(
    page.frameLocator("#email-preview").locator("body"),
  ).toContainText("$240.00");
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Review overflow at " + width,
    );
    await expect
      .poll(() =>
        page
          .locator(".preview-panel")
          .evaluate((panel) => panel.scrollHeight <= panel.clientHeight + 1),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page
          .locator("#email-preview")
          .evaluate(
            (frame) =>
              frame.contentDocument.documentElement.scrollHeight <=
              frame.clientHeight + 1,
          ),
      )
      .toBe(true);

    if (width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: "qa/admin-review-mobile.png",
        fullPage: true,
      });
    }
  }
  await page.getByRole("link", { name: /All invoices/ }).click();
  await page.getByRole("textbox", { name: "Search invoices" }).fill(number);
  await expect(page.locator(".invoice-table tbody tr")).toHaveCount(1);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "qa/admin-list-desktop.png", fullPage: true });
  await page
    .getByRole("link", { name: "Create Invoice", exact: true })
    .first()
    .click();
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Create overflow at " + width,
    );
    await page.getByRole("button", { name: /^Due date/ }).click();
    const bounds = await page.locator("#invoice-calendar").boundingBox();
    assert(
      bounds.x >= 0 && bounds.x + bounds.width <= width + 1,
      "Calendar clipped at " + width,
    );
    await page.keyboard.press("Escape");
    if (width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: "qa/admin-create-mobile.png",
        fullPage: true,
      });
    }
  }
  assert.equal(
    (
      await page.request.post(base + "/api/admin/invoices", {
        headers: { origin: "https://example.com" },
        data: { action: "preview", data: {} },
      })
    ).status(),
    404,
  );
  assert.equal(
    (
      await page.request.get(base + "/api/admin/invoices", {
        headers: { "x-forwarded-for": "203.0.113.4" },
      })
    ).status(),
    404,
  );
  await page.goto(base + "/admin/review", { waitUntil: "networkidle" });
  await expect(page.locator(".stripe-card")).toHaveCount(0);
  const testRow = page
    .locator(".invoice-table tbody tr")
    .filter({ hasText: number });
  await expect(
    testRow.getByRole("link", { name: "Edit " + number, exact: true }),
  ).toHaveAttribute("href", "/admin?edit=" + id);
  const deleteCandidate = (
    await (await page.request.get(base + "/api/admin/invoices?id=" + id)).json()
  ).invoice;
  const staleDelete = await page.request.post(base + "/api/admin/invoices", {
    headers: { origin: base },
    data: {
      action: "delete",
      id,
      revision: deleteCandidate.revision + 1,
      confirm: true,
    },
  });
  assert.equal(staleDelete.status(), 409);
  const noConfirmation = await page.request.post(base + "/api/admin/invoices", {
    headers: { origin: base },
    data: { action: "delete", id, revision: deleteCandidate.revision },
  });
  assert.equal(noConfirmation.status(), 400);
  await testRow
    .getByRole("button", { name: "Delete " + number, exact: true })
    .click();
  await expect(testRow).toHaveCount(0);
  assert.equal(
    (await page.request.get(base + "/api/admin/invoices?id=" + id)).status(),
    404,
  );
  assert.equal((await page.request.get(secondLink)).status(), 404);
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await expect(page.locator(".service-showcase .service-tile")).toHaveCount(5);
  await expect(page.locator('link[href="/admin/invoices.css"]')).toHaveCount(0);
  assert.deepEqual(errors, []);
  assert.equal(
    sendAttempts,
    2,
    "Both email sends must be mocked during browser verification",
  );
  assert.notEqual(sendKeys[0], sendKeys[1]);
  console.log(
    "Passed: create, live preview, save, edit, link generation and invalidation, persistence, review/search, send confirmation, 5 responsive sizes, localhost guards, unchanged public page. No emails sent.",
  );
} finally {
  await browser.close();
  if (id) {
    const filename = new URL("../.local-admin/invoices.json", import.meta.url);
    const data = JSON.parse(await fs.readFile(filename, "utf8"));
    await fs.writeFile(
      filename,
      JSON.stringify(
        data.filter((invoice) => invoice.id !== id),
        null,
        2,
      ),
    );
  }
}
