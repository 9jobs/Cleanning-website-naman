import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";
import { services, articles } from "../src/lib/data.ts";

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
await page.route("**/api/**", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
const routes = ["/", "/about", "/pricing", "/contact", "/services", "/areas", "/reviews", "/faq", "/blog", "/careers", "/privacy", "/terms", "/book/confirmation", "/quote/confirmation", ...services.map((s) => `/services/${s.slug}`), ...articles.map((a) => `/blog/${a.slug}`)];
const checks = [];
for (const route of routes) {
  await page.goto(`http://localhost:4317${route}`);
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => [...document.querySelectorAll("main .motion-reveal")].every((e) => e.dataset.revealState));
  await page.waitForTimeout(250);
  const measurements = await page.evaluate(async () => {
    const widths = [];
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
      widths.push(document.documentElement.scrollWidth);
    }
    return widths;
  });
  assert(Math.max(...measurements) <= 391, `${route} overflow while scrolling`);
  await page.waitForTimeout(1100);
  const pending = await page.locator('main [data-reveal-state="pending"]').evaluateAll((nodes) => nodes.filter((e) => {const r=e.getBoundingClientRect(); return r.width>0 && r.height>0;}).map((e) => e.textContent.slice(0,100)));
  assert.deepEqual(pending, [], `${route} hidden reveal`);
  const broken = await page.locator("main img").evaluateAll((images) => images.filter((e) => e.getBoundingClientRect().height > 0 && (!e.complete || !e.naturalWidth)).map((e) => e.getAttribute("src")));
  assert.deepEqual(broken, [], `${route} image loading`);
  checks.push({ route, width: 390, scrollSamples: measurements.length });
  console.log("motion", route);
}
for (const [route, width] of [["/",320],["/",768],["/",1024],["/pricing",810],["/contact",320],["/services/property-cleaning",320]]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`http://localhost:4317${route}`);
  await page.waitForTimeout(150);
  await page.evaluate(async () => {await document.fonts.ready;for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo({top:y,behavior:"instant"});await new Promise(r=>setTimeout(r,100));}});
  await page.waitForTimeout(1100);
  const style = "header,nextjs-portal,.back-top,.skip-link{visibility:hidden!important}";
  if (route === "/") {
    await page.locator(".service-showcase").screenshot({ path: `qa/responsive-services-${width}-final.png`, style });
    await page.locator("footer").screenshot({ path: `qa/responsive-footer-${width}-final.png`, style });
    await page.locator(".carousel-hero").screenshot({ path: `qa/responsive-hero-${width}-final.png`, style });
  } else {
    await page.locator(route === "/pricing" ? ".pricing-plan-grid" : route === "/contact" ? ".contact-quote-card" : "main").screenshot({ path: `qa/responsive-${route.slice(1).replaceAll("/","--")}-${width}-final.png`, style });
  }
}
assert.deepEqual(errors, []);
await browser.close();
await fs.writeFile("qa/responsive-motion-results.json", JSON.stringify({ checks, errors, liveSubmissions: 0 }, null, 2));
console.log(JSON.stringify({ normalMotionPages: checks.length, errors, liveSubmissions: 0 }));
