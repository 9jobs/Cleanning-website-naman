import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { services, articles } from "../src/lib/data.ts";

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/**", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
const retired = ["end-of-lease-cleaning", "window-cleaning", "oven-cleaning"];
assert.equal(services.length, 8);
assert(!services.some((service) => retired.includes(service.slug)));
const widths = [320,390,430,600,768,810,1024,1440,1920];
let layoutChecks = 0;
for (const route of ["/", "/services", "/contact", "/pricing", "/faq", "/about", "/blog", ...services.map((service) => `/services/${service.slug}`), ...articles.map((article) => `/blog/${article.slug}`)]) {
  await page.goto(`http://localhost:4317${route}`);
  await page.locator("main h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (const slug of retired) await expect(page.locator(`a[href*="/services/${slug}"]`)).toHaveCount(0);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(100);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow ${route} ${width}`);
    if (width <= 600) await expect(page.locator("header .header-actions")).toBeHidden();
    if (width >= 768) await expect(page.locator("header .header-actions")).toBeVisible();
    layoutChecks++;
  }
  if (route === "/") {
    await expect(page.locator(".service-tile")).toHaveCount(6);
    for (const img of await page.locator(".service-tile img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((e) => e.complete && e.naturalWidth > 0)).toBe(true);
    }
    await expect(page.locator(".moving-section")).not.toContainText("End of Lease");
  }
}
await page.setViewportSize({ width:1440, height:1000 });
await page.goto("http://localhost:4317/");
await page.locator("header summary").click();
await expect(page.locator(".mega-panel a")).toHaveCount(8);
await page.goto("http://localhost:4317/contact");
const options = await page.locator("#contact-service option").evaluateAll((nodes) => nodes.map((e) => e.value));
assert.equal(options.length, 9);
assert(!options.some((slug) => retired.includes(slug)));
for (const category of ["Residential", "Commercial"]) {
  await page.goto("http://localhost:4317/pricing");
  await page.getByRole("button", { name:category, exact:true }).click();
  const headings = await page.locator(".pricing-plan-card h2").allTextContents();
  assert.equal(headings.length, 4);
  if (category === "Residential") {
    assert(headings.includes("Deep Cleaning"));
    assert(!headings.includes("Garden Cleaning") && !headings.includes("Carpet Cleaning"));
    assert(!headings.includes("Commercial Cleaning"));
  }
  else for (const name of ["Commercial Cleaning","Office Cleaning","Construction Cleaning","Airbnb Cleaning"]) assert(headings.includes(name));
  for (const width of widths) {
    await page.setViewportSize({ width, height:1000 });
    await page.waitForTimeout(80);
    const boxes = await page.locator(".pricing-plan-card").evaluateAll((nodes) => nodes.map((e) => {const r=e.getBoundingClientRect();return{x:r.x,right:r.right,width:r.width};}));
    assert(boxes.every((r) => r.x >= 0 && r.right <= width + 1));
    assert(Math.max(...boxes.map((r) => r.width)) - Math.min(...boxes.map((r) => r.width)) < 1);
    for (const price of await page.locator(".pricing-plan-price strong").all()) await expect(price).toHaveText("AUD $60");
  }
  const links = await page.locator(".pricing-plan-actions a").evaluateAll((nodes) => nodes.map((e) => e.getAttribute("href")));
  for (const link of links) {
    const slug = new URL(link,"http://localhost:4317").searchParams.get("service");
    assert(services.some((service) => service.slug === slug));
    await page.goto("http://localhost:4317" + link);
    await expect(page).toHaveURL(/\/contact\?/);
    await expect(page.locator("#contact-service")).toHaveValue(slug);
  }
}
for (const slug of retired) {
  await page.goto(`http://localhost:4317/services/${slug}`);
  await expect(page.locator("main h1")).toHaveText("Looking for a clean start?");
}
assert.deepEqual(errors, []);
await browser.close();
const result = { activeServices:8, retiredServices:retired, residentialPlans:4, commercialPlans:4, price:"AUD $60 / hour unchanged", layoutChecks, widths, allPlanLinksReachContact:true, liveSubmissions:0, errors };
await fs.writeFile("qa/service-options-results.json",JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
