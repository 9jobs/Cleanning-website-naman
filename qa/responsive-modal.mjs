import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
let accepted = false;
let calls = 0;
await p.route("**/api/contact", async (r) => {
  calls++;
  await r.fulfill({
    status: accepted ? 200 : 503,
    contentType: "application/json",
    body: JSON.stringify(
      accepted
        ? { reference: "12345678-1234-4234-8234-123456789abc" }
        : { error: "Local intercepted failure" },
    ),
  });
});
await p.goto(
  "http://localhost:4317/book?service=property-cleaning&frequency=One-off",
);
await p.waitForURL("**/contact?service=property-cleaning&frequency=One-off");
await expect(p.locator("#contact-service")).toHaveValue("property-cleaning");
await expect(p.locator("#contact-frequency")).toHaveValue("One-off");
assert.equal(
  await p
    .getByText("Book Your Professional Cleaning Service.", { exact: true })
    .count(),
  0,
);
async function fill() {
  await p.locator("#contact-name").fill("Local Popup Verification");
  await p.locator("#contact-email").fill("popup@example.com");
  await p.locator("#contact-phone").fill("+61 422 279 428");
  await p.locator("#contact-property").selectOption("House");
  await p.locator("#contact-location").fill("Rosanna VIC 3084");
  await p.getByLabel("I agree to be contacted").check();
}
await fill();
await p.getByRole("button", { name: "Get My Free Quote", exact: true }).click();
await expect(p.locator(".contact-quote-alert[role=alert]")).toContainText(
  "Local intercepted failure",
);
await expect(p.locator("dialog")).toHaveCount(0);
accepted = true;
await p.getByRole("button", { name: "Get My Free Quote", exact: true }).click();
const dialog = p.getByRole("dialog", {
  name: "Thank you. We’ve received your enquiry.",
});
await expect(dialog).toBeVisible();
assert(await dialog.evaluate((e) => e.matches(":modal")));
assert.equal(await p.locator(".contact-quote-success").count(), 0);
await expect(p.locator("#contact-quote-title")).toHaveText(
  "Request a Cleaning Quote",
);
await expect(
  dialog.getByRole("link", { name: "Back to Home" }),
).toHaveAttribute("href", "/");
for (let i = 0; i < 6; i++) {
  await p.keyboard.press("Tab");
  assert(await dialog.evaluate((e) => e.contains(document.activeElement)));
}
for (const [width, height] of [[320,568],[375,667],[390,844],[430,932],[768,1024],[1024,768],[667,375],[844,390],[1440,1000]]) {
  await p.setViewportSize({ width, height });
  await p.waitForTimeout(100);
  const box = await dialog.boundingBox();
  assert(
    box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= width + 1 &&
      box.y + box.height <= height + 1,
  );
  if ([390, 1440].includes(width))
    await p.screenshot({ path: `qa/responsive-success-popup-${width}.png` });
}
await p.keyboard.press("Escape");
await expect(dialog).toHaveCount(0);
await expect(p.locator("#contact-name")).toHaveValue("");
await p.locator("#contact-service").selectOption("house-cleaning");
await fill();
await p.getByRole("button", { name: "Get My Free Quote", exact: true }).click();
await expect(dialog).toBeVisible();
await dialog.getByRole("link", { name: "Back to Home" }).click();
await p.waitForURL("http://localhost:4317/");
await expect(p.locator("#home-title")).toBeVisible();
assert.deepEqual(errors, []);
await b.close();
console.log(
  JSON.stringify({
    bookingRedirectsToContact: true,
    existingServiceSelectionPreserved: true,
    modalOnlyAfterSuccessfulResponse: true,
    nativeFocusTrap: true,
    escapeResetsForm: true,
    backToHome: true,
    viewportSizes: 9,
    realSubmissions: 0,
    interceptedRequests: calls,
    errors,
  }),
);
