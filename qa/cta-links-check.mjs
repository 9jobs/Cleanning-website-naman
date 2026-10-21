import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.route("**/api/**", (r) => r.abort());
await p.goto("http://localhost:4317");
await expect(p.locator(".carousel-hero")).toBeVisible();
const header = p.locator(".site-header");
assert.equal(await header.getByText("Get a Quote", { exact: true }).count(), 0);
await expect(
  header.locator(".header-actions").getByRole("link", { name: "Book A Call" }),
).toHaveAttribute("href", "tel:+61422552002");
await p.clock.install();
await p.mouse.move(1430, 990);
const slides = [];
for (let i = 0; i < 4; i++) {
  const hero = p.locator(".carousel-hero");
  const service = await hero.getAttribute("data-active-service");
  slides.push(service);
  await expect(
    hero.getByRole("link", { name: "Request a Clean", exact: true }),
  ).toHaveAttribute("href", "/contact");
  const team = hero.getByRole("link", { name: "Talk to Our Team on WhatsApp" });
  const url = new URL(await team.getAttribute("href"));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/61422552002");
  assert(url.searchParams.get("text").includes("cleaning needs"));
  await expect(team).toHaveAttribute("target", "_blank");
  if (i === 0) await p.screenshot({ path: "qa/cta-home-desktop.png" });
  await p.clock.fastForward(6600);
}
assert.equal(new Set(slides).size, 4);
await p.clock.resume();
const response = await p.goto("http://localhost:4317/book");
assert.equal(response.status(), 200);
await expect(p.locator("h1")).toBeVisible();
await p.goto("http://localhost:4317/pricing");
await expect(p.locator(".pricing-plan-actions a")).toHaveCount(3);
assert.equal(
  await p
    .locator(".pricing-plans")
    .getByText("Get a Quote", { exact: true })
    .count(),
  0,
);
for (const a of await p.locator(".pricing-plan-actions a").all()) {
  const url = new URL(await a.getAttribute("href"), "http://localhost:4317");
  assert.equal(url.pathname, "/book");
  assert(url.searchParams.get("service"));
}
await p
  .locator(".pricing-plan-grid")
  .screenshot({ path: "qa/cta-pricing-final.png" });
await p.getByRole("button", { name: "Property Cleaning", exact: true }).click();
await expect(p.locator(".pricing-plan-actions a")).toHaveCount(2);
assert.equal(
  await p
    .locator(".pricing-plans")
    .getByText("Get a Quote", { exact: true })
    .count(),
  0,
);
await p.setViewportSize({ width: 390, height: 844 });
await p.goto("http://localhost:4317");
await expect(
  header.locator(".header-actions").getByRole("link", { name: "Book A Call" }),
).toBeVisible();
await p.getByRole("button", { name: "Open navigation" }).click();
await expect(
  p.locator("#mobile-nav").getByRole("link", { name: "Book A Call" }),
).toHaveAttribute("href", "tel:+61422552002");
assert(
  await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
assert.deepEqual(errors, []);
await browser.close();
console.log(
  JSON.stringify({
    allFourHeroSlides: true,
    whatsAppNumber: "61422552002",
    callNumber: "+61422552002",
    bookingRoute: 200,
    pricingQuoteButtonsRemoved: true,
    mobileNavigation: true,
    noExternalCallsOrMessagesSent: true,
    errors,
  }),
);
