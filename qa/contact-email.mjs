import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1100 },
  reducedMotion: "reduce",
});
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:4317/contact");
await p.locator("h1").waitFor({ state: "visible" });
let requests = 0;
p.on("request", (r) => {
  if (r.url().endsWith("/api/contact")) requests++;
});
await p.getByRole("button", { name: "Get My Free Quote", exact: true }).click();
await expect(
  p.getByText("Enter your full name", { exact: true }),
).toBeVisible();
expect(requests).toBe(0);
await p.getByLabel("Full Name", { exact: false }).fill("Website Delivery Test");
await p
  .getByLabel("Email Address", { exact: false })
  .fill("Thrive4cleaning@gmail.com");
await p.getByLabel("Phone Number", { exact: false }).fill("0400000000");
await p
  .getByLabel("Cleaning Service", { exact: false })
  .selectOption("regular-house-cleaning");
await p.getByLabel("Property Type", { exact: false }).selectOption("Office");
await expect(p.getByText("Workplace Details", { exact: true })).toBeVisible();
await p.getByLabel("Property Type", { exact: false }).selectOption("House");
await expect(p.getByText("Residential Details", { exact: true })).toBeVisible();
await p.getByRole("button", { name: "More bedrooms", exact: true }).click();
await expect(p.locator("#contact-bedrooms")).toHaveValue("3");
await p.getByLabel("Suburb / Postcode", { exact: false }).fill("3000");
await p
  .getByLabel("Additional Requirements", { exact: false })
  .fill(
    "WEBSITE DELIVERY TEST ONLY — please ignore as a customer enquiry. This email was sent with the site owner’s authorisation to verify the new Thrive4 Cleaning contact form, Gmail delivery and residential details. No cleaning appointment is requested.",
  );
await p.getByRole("checkbox").check();
const responsePromise = p.waitForResponse(
  (r) => r.url().endsWith("/api/contact"),
  { timeout: 60000 },
);
await p.getByRole("button", { name: "Get My Free Quote", exact: true }).click();
const response = await responsePromise;
const result = await response.json();
if (response.status() !== 200) {
  console.log(
    JSON.stringify({ status: response.status(), error: result.error }),
  );
  await b.close();
  process.exit(1);
}
await expect(p.getByRole("heading", { level: 1 })).toContainText(
  "Your enquiry is on its way.",
);
const original = JSON.parse(response.request().postData());
const replay = await p.request.post("http://localhost:4317/api/contact", {
  headers: { origin: "http://localhost:4317" },
  data: original,
});
expect(replay.status()).toBe(200);
expect((await replay.json()).reference).toBe(result.reference);
await p.screenshot({ path: "qa/contact-email-success.png" });
const malformed = await p.request.post("http://localhost:4317/api/contact", {
  headers: { origin: "http://localhost:4317" },
  data: {},
});
expect(malformed.status()).toBe(400);
const crossOrigin = await p.request.post("http://localhost:4317/api/contact", {
  headers: { origin: "https://example.invalid" },
  data: original,
});
expect(crossOrigin.status()).toBe(403);
await p.goto(
  "http://localhost:4317/contact?service=deep-cleaning&postcode=3000",
);
await expect(p.getByLabel("Cleaning Service", { exact: false })).toHaveValue(
  "deep-cleaning",
);
await expect(p.getByLabel("Suburb / Postcode", { exact: false })).toHaveValue(
  "3000",
);
expect(errors).toEqual([]);
await fs.writeFile(
  "qa/contact-email-report.json",
  JSON.stringify(
    {
      smtpAccepted: true,
      testEmailsSent: 1,
      idempotentReplay: true,
      validation: true,
      crossOriginBlocked: true,
      servicePrefill: true,
      reference: result.reference,
      errors,
    },
    null,
    2,
  ),
);
await b.close();
console.log(
  JSON.stringify(
    {
      smtpAccepted: true,
      testEmailsSent: 1,
      idempotentReplay: true,
      validation: true,
      crossOriginBlocked: true,
      servicePrefill: true,
      errors,
    },
    null,
    2,
  ),
);
