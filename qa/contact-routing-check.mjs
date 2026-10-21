import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/**", (route) =>
  route.request().method() === "POST" ? route.abort() : route.continue(),
);
await page.goto("http://localhost:4317/quote?service=end-of-lease-cleaning");
await page.waitForURL("**/contact?service=end-of-lease-cleaning");
await expect(page.locator("#contact-service")).toHaveValue(
  "end-of-lease-cleaning",
);
await expect(
  page.getByText("Tell us what matters to your space.", { exact: true }),
).toHaveCount(0);
await expect(
  page.getByText("Development preview", { exact: true }),
).toHaveCount(0);
await expect(page.locator("#contact-quote-title")).toBeVisible();
const routes = [
  "/",
  "/about",
  "/pricing",
  "/contact",
  "/services",
  "/areas",
  "/faq",
  "/reviews",
  "/blog",
  "/careers",
  ...[
    "house",
    "property",
    "garden",
    "construction",
    "end-of-lease",
    "commercial",
    "office",
    "airbnb",
    "carpet",
    "window",
    "oven",
  ].map((name) => `/services/${name}-cleaning`),
];
let quoteLinks = 0;
for (const route of routes) {
  await page.goto(`http://localhost:4317${route}`);
  const links = await page
    .locator("a[href]")
    .evaluateAll((anchors) =>
      anchors.map((a) => ({
        href: a.getAttribute("href"),
        text: a.textContent.trim(),
      })),
    );
  assert(
    !links.some((link) => /^\/quote(?:\?|$)/.test(link.href)),
    `Old quote link on ${route}`,
  );
  for (const link of links.filter((link) =>
    /get.*quote|request.*quote/i.test(link.text),
  )) {
    assert(
      /^\/contact(?:\?|$)/.test(link.href),
      `${route}: ${link.text} -> ${link.href}`,
    );
    quoteLinks++;
  }
}
await page.goto("http://localhost:4317/services/end-of-lease-cleaning");
await page
  .getByRole("link", { name: "Get a Free Quote", exact: true })
  .first()
  .click();
await page.waitForURL("**/contact?service=end-of-lease-cleaning");
await expect(page.locator("#contact-service")).toHaveValue(
  "end-of-lease-cleaning",
);
await page.goto("http://localhost:4317/");
await page.evaluate(() => document.fonts.ready);
const noteStyle = await page.locator(".lead-form-note").evaluate((element) => {
  const s = getComputedStyle(element);
  return { size: parseFloat(s.fontSize), color: s.color, weight: s.fontWeight };
});
assert(noteStyle.size >= 12);
assert.equal(noteStyle.color, "rgb(41, 76, 61)");
const heroWeight = await page
  .locator(".carousel-benefits > span")
  .first()
  .evaluate((element) => getComputedStyle(element).fontWeight);
assert.equal(heroWeight, "600");
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  const centre = await footer
    .locator('[class*="copyright"]')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        midpoint: (rect.left + rect.right) / 2,
        alignment: getComputedStyle(element).textAlign,
      };
    });
  assert(
    Math.abs(centre.midpoint - width / 2) < 2,
    `Copyright not centred at ${width}`,
  );
  assert.equal(centre.alignment, "center");
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth),
    width,
    `Overflow at ${width}`,
  );
  if ([390, 1440].includes(width)) {
    await footer.screenshot({
      path: `qa/footer-centred-${width}.png`,
      style:
        ".site-header,.skip-link,.back-top,nextjs-portal{visibility:hidden!important}",
    });
    await page
      .locator(".reference-lead")
      .screenshot({
        path: `qa/quote-text-readable-${width}.png`,
        style:
          ".site-header,.skip-link,.back-top,nextjs-portal{visibility:hidden!important}",
      });
  }
}
assert.deepEqual(errors, []);
await browser.close();
const result = {
  routes: routes.length,
  quoteLinks,
  directQuoteRedirect: true,
  servicePreselection: true,
  oldQuoteScreenRemoved: true,
  readableNote: noteStyle,
  heroWeight,
  centredFooterWidths: 8,
  submissions: 0,
  errors,
};
await fs.writeFile(
  "qa/contact-routing-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
