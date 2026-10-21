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
let payload;
await p.route("**/api/contact", async (r) => {
  payload = r.request().postDataJSON();
  await r.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: "Local calendar check; no enquiry sent." }),
  });
});
await p.goto("http://localhost:4317/contact");
const trigger = p.locator("#contact-date");
await trigger.click();
const dialog = p.getByRole("dialog", {
  name: "Choose your preferred cleaning date",
});
await expect(dialog).toBeVisible();
const today = await dialog
  .locator("[aria-current=date]")
  .getAttribute("data-date");
await expect(
  dialog.getByRole("button", { name: "Previous month" }),
).toBeDisabled();
for (const day of await dialog.locator("td button:disabled").all())
  assert((await day.getAttribute("data-date")) < today);
await dialog.getByRole("button", { name: "Next month" }).click();
await expect(
  dialog.getByRole("button", { name: "Previous month" }),
).toBeEnabled();
const selected = await dialog
  .locator("td button")
  .first()
  .getAttribute("data-date");
await dialog.locator("td button").first().click();
await expect(dialog).toBeHidden();
assert.equal(
  await trigger.innerText(),
  selected.split("-").reverse().join("/"),
);
await trigger.click();
await expect(dialog.locator(`[data-date="${selected}"]`)).toBeFocused();
await p.keyboard.press("ArrowRight");
await p.keyboard.press("Enter");
await expect(dialog).toBeHidden();
await trigger.click();
await p.keyboard.press("Escape");
await expect(trigger).toBeFocused();
await expect(dialog).toBeHidden();
await trigger.click();
await dialog.getByRole("button", { name: "Clear", exact: true }).click();
await expect(trigger).toContainText("dd/mm/yyyy");
await trigger.click();
await dialog.getByRole("button", { name: "Today", exact: true }).click();
for (const width of [375, 390, 430, 768, 1024, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const box = await dialog.boundingBox();
  assert(box.x >= 0 && box.x + box.width <= width + 1);
  assert(
    box.y >= 0 && box.y + box.height <= 1001,
    JSON.stringify({ width, box }),
  );
  if ([390, 1440].includes(width))
    await p.screenshot({ path: `qa/calendar-popup-${width}.png` });
  await p.keyboard.press("Escape");
}
await p.locator("#contact-name").fill("Local Calendar Check");
await p.locator("#contact-email").fill("calendar@example.com");
await p.locator("#contact-phone").fill("+61 422 279 428");
await p.locator("#contact-service").selectOption("house-cleaning");
await p.locator("#contact-property").selectOption("House");
await p.locator("#contact-location").fill("Rosanna VIC 3084");
await p.getByLabel("I agree to be contacted").check();
await p.getByRole("button", { name: "Get My Free Quote", exact: true }).click();
await expect(p.locator(".contact-quote-alert[role=alert]")).toContainText(
  "Local calendar check",
);
assert.equal(payload.date, today);
assert.deepEqual(errors, []);
await b.close();
console.log(
  JSON.stringify({
    months: true,
    selection: true,
    keyboard: true,
    escapeAndClear: true,
    pastDatesDisabled: true,
    viewportWidths: 6,
    formDatePayload: payload.date,
    liveSubmissions: 0,
    errors,
  }),
);
