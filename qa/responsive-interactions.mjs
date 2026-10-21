import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, devices, expect } from "@playwright/test";
import { services } from "../src/lib/data.ts";
import { heroSlides } from "../src/components/hero-slides.ts";

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: "reduce" });
const errors = [];
const checks = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/**", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
const sizes = [[320,568],[360,800],[375,667],[390,844],[430,932],[600,960],[768,1024],[810,1080],[820,1180],[834,1194],[912,1368],[1024,768],[667,375],[844,390],[1366,1024]];
async function bounds(locator, width, height, vertical = true) {
  const r = await locator.boundingBox();
  assert(r && r.x >= -1 && r.x + r.width <= width + 1, JSON.stringify({ width, height, box: r }));
  if (vertical) assert(r.y >= -1 && r.y + r.height <= height + 1, JSON.stringify({ width, height, box: r }));
  return r;
}

for (const [width, height] of sizes.filter(([w]) => w <= 1150)) {
  await page.setViewportSize({ width, height });
  await page.goto("http://localhost:4317/contact");
  await page.waitForTimeout(100);
  const toggle = page.getByRole("button", { name: "Open navigation", exact: true });
  assert((await toggle.boundingBox()).height >= 44);
  await toggle.click();
  await page.waitForTimeout(250);
  await bounds(page.locator("#mobile-nav"), width, height);
  const call = page.locator("#mobile-nav a.button");
  await call.scrollIntoViewIfNeeded();
  await bounds(call, width, height);
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  for (const id of ["contact-bedrooms", "contact-bathrooms"]) {
    const value = page.locator(`#${id}`);
    assert((await value.boundingBox()).width >= 24, `${id} clipped at ${width}`);
  }
  if (width <= 1000) {
    for (const control of await page.locator('.contact-field input, .contact-field select, .contact-quote-extra textarea').all())
      assert(Number.parseFloat(await control.evaluate((e) => getComputedStyle(e).fontSize)) >= 16);
  }
  const date = page.locator("#contact-date");
  await date.click();
  const calendar = page.getByRole("dialog", { name: "Choose your preferred cleaning date" });
  await bounds(calendar, width, height);
  await calendar.getByRole("button", { name: "Next month" }).click();
  const day = calendar.locator("td button:not(:disabled)").first();
  const expected = await day.getAttribute("data-date");
  await day.click();
  await expect(calendar).toHaveCount(0);
  await expect(date).toContainText(expected.split("-").reverse().join("/"));
  await date.click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(date).toBeFocused();
  if (width === 320) await page.locator(".contact-property-details").screenshot({ path: "qa/responsive-counter-320-after.png", style: "header,nextjs-portal,.back-top,.skip-link{visibility:hidden!important}" });
  checks.push({ component: "menu, counter, input, calendar", width, height });
}

for (const width of [320,390,600,768,810,900,1024,1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("http://localhost:4317/pricing");
  for (const label of ["Residential", "Property Cleaning"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const cards = page.locator(".pricing-plan-card");
    const boxes = await cards.evaluateAll((nodes) => nodes.map((e) => {const r = e.getBoundingClientRect(); return {x:r.x, y:r.y, w:r.width, right:r.right};}));
    for (const box of boxes) assert(box.x >= 0 && box.right <= width + 1);
    assert(Math.max(...boxes.map((r) => r.w)) - Math.min(...boxes.map((r) => r.w)) < 1);
    if (width >= 600 && width <= 900) assert(Math.abs(boxes[0].y - boxes[1].y) < 1);
    for (const card of await cards.all()) {
      const icon = await card.locator(".pricing-plan-icon").boundingBox();
      if (await card.locator(".pricing-plan-badge").count()) {
        const badge = await card.locator(".pricing-plan-badge").boundingBox();
        assert(icon.x + icon.width <= badge.x + 1, `Price badge collision ${width}`);
      }
      await expect(card.getByRole("link", { name: "Pay Now" })).toHaveAttribute("href", /^\/book\?service=/);
    }
  }
  checks.push({ component: "pricing tabs and card sizing", width });
}

for (const width of [320,768,1024]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const service of services) {
    await page.goto(`http://localhost:4317/services/${service.slug}`);
    const faq = page.locator("main button[aria-expanded][aria-controls]").first();
    await faq.click();
    await expect(faq).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`[id="${await faq.getAttribute("aria-controls")}"]`)).toBeVisible();
    await faq.press("Enter");
    await expect(faq).toHaveAttribute("aria-expanded", "false");
    if (await page.getByRole("tab").count()) {
      const tabs = page.getByRole("tab");
      await tabs.first().click();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel")).toBeVisible();
    }
    checks.push({ component: "service accordion / tabs", route: service.slug, width });
  }
}

await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://localhost:4317/");
await page.locator("header summary").click();
await bounds(page.locator(".mega-panel"), 1440, 1000);
await expect(page.locator(".mega-panel a")).toHaveCount(11);
await page.keyboard.press("Escape");
assert.equal(await page.locator("header details").getAttribute("open"), null);

await page.clock.install();
await page.reload();
for (const slide of heroSlides) {
  await expect(page.locator(".carousel-hero")).toHaveAttribute("data-active-service", slide.id);
  await expect(page.locator("#home-title")).toContainText(slide.titleLine1);
  await expect(page.locator(".carousel-photo.is-active img")).toHaveAttribute("src", slide.image);
  const pause = page.getByRole("button", { name: "Pause banner autoplay", exact: true });
  await pause.focus(); await page.keyboard.press("Enter"); await page.locator(".carousel-hero > button").evaluate((e) => e.blur());
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(80);
    await page.clock.runFor(100);
    const result = await page.locator(".carousel-hero").evaluate((hero) => {
      const r = hero.getBoundingClientRect();
      return [...hero.querySelectorAll("h1,.carousel-content p,.actions,.carousel-benefits")].every((e) => {const b = e.getBoundingClientRect();return b.x >= -1 && b.right <= innerWidth + 1 && b.bottom <= r.bottom + 1 && e.scrollWidth <= e.clientWidth + 2;});
    });
    assert(result, `Hero content clipping ${slide.id} ${width}`);
  }
  checks.push({ component: "hero image/copy and layout", slide: slide.id, sizes: sizes.length });
  await page.getByRole("button", { name: "Start banner autoplay", exact: true }).focus();
  await page.keyboard.press("Enter"); await page.locator(".carousel-hero > button").evaluate((e) => e.blur());
  await page.mouse.move(0, 0);
  await page.clock.runFor(6600);
}
await page.clock.resume();

for (const device of ["iPhone SE", "iPhone 13", "iPhone 14 Pro Max", "Pixel 7", "iPad Mini", "iPad Pro 11"]) {
  const context = await browser.newContext({ ...devices[device], defaultBrowserType: undefined, reducedMotion: "reduce" });
  const mobile = await context.newPage();
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.route("**/api/**", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
  await mobile.goto("http://localhost:4317/");
  const slider = mobile.getByRole("slider", { name: "Compare before and after cleaning images" });
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  const cdp = await context.newCDPSession(mobile);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width * 0.8, y: box.y + box.height / 2 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  assert(Number(await slider.inputValue()) > 65, `Touch slider ${device}`);
  for (const name of ["Garden", "Construction", "Property"]) {
    await mobile.getByRole("group", { name: "Comparison cleaning area" }).getByRole("button", { name, exact: true }).tap();
    await expect(slider).toHaveValue("50");
  }
  assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  checks.push({ component: "Chrome device emulation / touch slider", device, viewport: mobile.viewportSize() });
  await context.close();
}

assert.deepEqual(errors, []);
await browser.close();
await fs.writeFile("qa/responsive-interactions-results.json", JSON.stringify({ checks, errors, liveSubmissions: 0 }, null, 2));
console.log(JSON.stringify({ interactionGroups: checks.length, errors, liveSubmissions: 0 }));
