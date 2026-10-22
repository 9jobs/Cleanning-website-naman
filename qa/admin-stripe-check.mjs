import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
const base = "http://localhost:4317";
const saved = JSON.parse(
  await fs.readFile(".local-admin/stripe-qa-invoice.json", "utf8"),
);
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  const data = await (
    await page.request.get(`${base}/api/admin/invoices?id=${saved.id}`)
  ).json();
  assert.equal(data.invoice.checkout.accountId, "acct_1USt0pLVzsWcldA8");
  assert.equal(data.invoice.checkout.paymentStatus, "paid");
  assert.equal(data.invoice.amount, 60);
  assert.equal(data.link, undefined);
  await page.goto(`${base}/admin/review?id=${saved.id}`, {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByRole("heading", { name: "Paid · Stripe test mode", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#generate-link")).toBeDisabled();
  await expect(page.locator("#send-invoice")).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Edit invoice", exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .frameLocator("#email-preview")
      .getByText("Paid · Stripe test mode", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .frameLocator("#email-preview")
        .locator(".invoice-logo")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1100 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "overflow " + width,
    );
    await expect
      .poll(() =>
        page
          .locator(".preview-panel")
          .evaluate((panel) => panel.scrollHeight <= panel.clientHeight + 1),
      )
      .toBe(true);
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `qa/admin-stripe-paid-${width}.png`,
        fullPage: true,
      });
  }
  const blocked = await page.request.post(base + "/api/admin/invoices", {
    headers: { origin: base },
    data: {
      action: "delete",
      id: saved.id,
      revision: data.invoice.revision,
      confirm: true,
    },
  });
  assert.equal(blocked.status(), 409);
  await page.goto(base + "/admin/review", { waitUntil: "networkidle" });
  await expect(
    page
      .locator(".invoice-table tbody tr")
      .filter({ hasText: data.invoice.number }),
  ).toContainText("Paid (test)");
  await expect(page.locator(".stripe-card")).toHaveCount(0);
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await expect(page.locator(".service-showcase .service-tile")).toHaveCount(5);
  await expect(page.locator('link[href="/admin/invoices.css"]')).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: Thrive4-only test payment is paid; server guard blocks mutation; email preview logo and Paid state; five responsive widths; public website unchanged. No emails or additional payments sent.",
  );
} finally {
  await browser.close();
}
