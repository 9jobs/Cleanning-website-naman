import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({ reducedMotion: "reduce" });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("502")) errors.push(m.text());
});
await p.goto("http://localhost:4317");
await p.evaluate(() => document.fonts.ready);
const form = p.getByRole("form", { name: "Quick cleaning quote" });
const results = [];
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.waitForTimeout(150);
  await form.scrollIntoViewIfNeeded();
  const s = await p.locator(".hero-enquiry").evaluate((e) => ({
    glass: getComputedStyle(e).backdropFilter,
    shadow: getComputedStyle(e).boxShadow,
    radii: [
      e,
      ...e.querySelectorAll(
        'input:not([name="website"]),button,.lead-form-heading>span',
      ),
    ].map((n) => getComputedStyle(n).borderRadius),
    overflow: [...e.querySelectorAll('h2,input:not([name="website"]),button,p')]
      .filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 2 && (r.left < -1 || r.right > innerWidth + 1);
      })
      .map((n) => n.tagName),
  }));
  assert(s.glass.includes("blur(22px)"));
  assert.notEqual(s.shadow, "none");
  assert(s.radii.every((v) => v === "0px"));
  assert.deepEqual(s.overflow, []);
  results.push({ width, ...s });
  if ([390, 1440].includes(width))
    await p
      .locator(".hero-enquiry")
      .screenshot({ path: `qa/quick-quote-glass-${width}.png` });
}
await p.setViewportSize({ width: 390, height: 1000 });
let calls = [];
let phase = "failure";
await p.route("**/api/quick-quote", async (r) => {
  calls.push(r.request().postDataJSON());
  await new Promise((resolve) => setTimeout(resolve, 350));
  await r.fulfill({
    status: phase === "failure" ? 502 : 200,
    contentType: "application/json",
    body: JSON.stringify(
      phase === "failure"
        ? {
            error:
              "Your request is saved, but the email notification could not be sent. Please retry with the same details.",
          }
        : { reference: calls.at(-1).submissionId },
    ),
  });
});
const submit = form.getByRole("button", { name: "Get My Free Quote" });
await submit.click();
await expect(form.getByText("Enter your first name")).toBeVisible();
assert.equal(calls.length, 0);
await form.getByLabel("First name", { exact: true }).fill("UI Test");
await form.getByLabel("Email address", { exact: true }).fill("bad");
await form.getByLabel("Phone number", { exact: true }).fill("123");
await submit.click();
await expect(form.getByText("Enter a valid email address")).toBeVisible();
assert.equal(calls.length, 0);
await form
  .getByLabel("Email address", { exact: true })
  .fill("test@example.com");
await form.getByLabel("Phone number", { exact: true }).fill("0412345678");
await submit.click();
await expect(
  form.getByRole("button", { name: "Sending your request…" }),
).toBeDisabled();
await expect(form.getByLabel("First name", { exact: true })).toHaveAttribute(
  "readonly",
  "",
);
await expect(p.locator('.hero-enquiry [role="alert"]')).toContainText(
  "notification",
);
await expect(form.getByLabel("First name", { exact: true })).toHaveValue(
  "UI Test",
);
assert.equal(calls.length, 1);
assert.equal(calls[0].consent, true);
assert.equal(calls[0].website, "");
assert(!("service" in calls[0]));
phase = "success";
await submit.click();
await expect(p.locator('.hero-enquiry [role="status"]')).toContainText(
  "Your quote request has been received",
);
assert.equal(calls[1].submissionId, calls[0].submissionId);
await p
  .locator(".hero-enquiry")
  .screenshot({ path: "qa/quick-quote-success-mobile.png" });
await p.getByRole("button", { name: "Send another request" }).click();
await expect(form).toBeVisible();
await expect(form.getByLabel("First name", { exact: true })).toBeEmpty();
await form.getByLabel("First name", { exact: true }).fill("UI Changed Test");
await form
  .getByLabel("Email address", { exact: true })
  .fill("test@example.com");
await form.getByLabel("Phone number", { exact: true }).fill("0412345678");
await submit.click();
await expect(p.locator('.hero-enquiry [role="status"]')).toBeVisible();
assert.notEqual(calls[2].submissionId, calls[0].submissionId);
assert.deepEqual(errors, []);
await b.close();
fs.writeFileSync(
  "qa/quick-quote-ui-report.json",
  JSON.stringify(
    {
      layouts: results,
      clientValidation: true,
      pendingGuard: true,
      failedSendRetainsValues: true,
      retrySameReference: true,
      newRequestNewReference: true,
      mockedSuccessOnly: true,
      liveEmailsSent: 0,
      errors,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    layouts: results.length,
    sharpCorners: true,
    glassAndShadow: true,
    clientValidation: true,
    pendingAndRetry: true,
    liveEmailsSent: 0,
    errors,
  }),
);
