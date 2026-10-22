import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const base = "http://localhost:4317",
  seen = [];
page.on("pageerror", (e) => {
  throw e;
});
await page.route("**/api/pricing/checkout", async (route) => {
  const data = route.request().postDataJSON();
  seen.push(data);
  assert.match(data.requestId, /^[a-f0-9-]{36}$/);
  assert.deepEqual(Object.keys(data).sort(), ["requestId", "service"]);
  await route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: "Checkout test: retry available." }),
  });
});
try {
  await page.goto(base + "/pricing", { waitUntil: "networkidle" });
  for (const category of ["Residential", "Commercial"]) {
    await page.getByRole("button", { name: category, exact: true }).click();
    const cards = page.locator(".pricing-plan-card");
    await expect(cards).toHaveCount(3);
    for (const card of await cards.all()) {
      await expect(card).toContainText("AUD $70");
      await card.getByRole("link", { name: "Pay Now", exact: true }).click();
      await expect(card.getByRole("alert")).toHaveText(
        "Checkout test: retry available.",
      );
      await expect(
        card.getByRole("link", { name: "Pay Now", exact: true }),
      ).toHaveAttribute("aria-disabled", "false");
    }
  }
  assert.equal(new Set(seen.map((v) => v.service)).size, 6);
  await page.getByRole("button", { name: "Residential", exact: true }).click();
  const first = page.locator(".pricing-plan-card").first();
  await first.getByRole("link", { name: "Pay Now", exact: true }).click();
  await expect(first.getByRole("alert")).toBeVisible();
  assert.equal(seen[0].requestId, seen[6].requestId);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "overflow " + width,
    );
  }
  for (const body of [
    { service: "garden-cleaning", requestId: crypto.randomUUID() },
    { service: "house-cleaning", requestId: crypto.randomUUID(), amount: 1 },
  ]) {
    const r = await page.request.post(base + "/api/pricing/checkout", {
      headers: { origin: base },
      data: body,
    });
    assert.equal(r.status(), 400);
  }
  const cross = await page.request.post(base + "/api/pricing/checkout", {
    headers: { origin: "https://example.com" },
    data: { service: "house-cleaning", requestId: crypto.randomUUID() },
  });
  assert.equal(cross.status(), 404);
  await page.goto(base + "/pricing/confirmation?session_id=cs_test_fake", {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByRole("heading", {
      name: "Payment has not been confirmed.",
      exact: true,
    }),
  ).toBeVisible();
  console.log(
    "PASS: all six pricing buttons submit only service/request ID; retries retain idempotency; errors recover; four responsive widths; bad-service, price tampering and cross-origin requests rejected; fake success cannot confirm payment. No payments created by this QA.",
  );
} finally {
  await browser.close();
}
