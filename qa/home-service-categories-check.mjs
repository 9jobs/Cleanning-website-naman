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
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:4317/", { waitUntil: "networkidle" });
for (const width of [1440, 390, 768, 320, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const selector of [".reference-packages"]) {
    const section = page.locator(selector);
    for (const category of ["Commercial", "Residential"]) {
      await section
        .getByRole("button", { name: category, exact: true })
        .click();
      await expect(
        section.getByRole("button", { name: category, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(section).not.toContainText(/Garden|Carpet\s*Cleaning/i);
      const titles = await section.locator("h3").allTextContents();
      const expected =
        category === "Residential"
          ? [
              "House Cleaning",
              "Deep Cleaning",
              "One-Off Cleaning",
              "Property Cleaning",
            ]
          : [
              "Commercial Cleaning",
              "Office Cleaning",
              "Construction Cleaning",
              "Airbnb Cleaning",
            ];
      if (
        titles.map((t) => t.replace(/\s+/g, "")).join("|") !==
        expected.map((t) => t.replace(/\s+/g, "")).join("|")
      )
        throw Error(JSON.stringify(titles));
      for (const image of await section.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((e) => e.complete && e.naturalWidth > 0))
          .toBe(true);
      }
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        throw Error("Overflow " + width);
      await section.screenshot({
        path: `qa/category-${selector.slice(1)}-${category.toLowerCase()}-${width}.png`,
      });
    }
  }
}
for (const width of [1440, 390, 768, 320, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  const section = page.locator(".service-showcase");
  await expect(
    section.getByRole("button", { name: /Residential|Commercial/ }),
  ).toHaveCount(0);
  await expect(section.locator(".service-tile")).toHaveCount(5);
  await expect(section).not.toContainText(/Garden|Carpet\s*Cleaning/i);
  const titles = await section.locator("h3").allTextContents();
  if (
    titles.join("|") !==
    [
      "House Cleaning",
      "Property Cleaning",
      "Construction Cleaning",
      "Airbnb Cleaning",
      "Commercial Cleaning",
    ].join("|")
  )
    throw Error("Unexpected mosaic services");
  for (const image of await section.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((e) => e.complete && e.naturalWidth > 0))
      .toBe(true);
  }
  const boxes = await section.locator(".service-tile").evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }),
  );
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i],
        b = boxes[j];
      if (
        Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 &&
        Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1
      )
        throw Error("Overlapping mosaic cards at " + width);
    }
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Overflow at " + width);
  await section.screenshot({ path: `qa/restored-service-mosaic-${width}.png` });
}
const slugs = [
  "house-cleaning",
  "deep-cleaning",
  "one-off-cleaning",
  "property-cleaning",
  "commercial-cleaning",
  "office-cleaning",
  "construction-cleaning",
  "airbnb-cleaning",
];
await page.setViewportSize({ width: 1440, height: 1000 });
for (const route of [
  "/",
  "/services",
  "/pricing",
  "/about",
  "/contact",
  "/book",
  "/faq",
  "/blog",
  ...slugs.map((s) => "/services/" + s),
]) {
  await page.goto("http://localhost:4317" + route, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /garden|carpet cleaning/i,
  );
  await expect(
    page.locator('a[href*="garden-cleaning"],a[href*="carpet-cleaning"]'),
  ).toHaveCount(0);
  if (route === "/services") {
    for (const category of ["Residential", "Commercial"]) {
      await page.getByRole("button", { name: category, exact: true }).click();
      await expect(page.getByRole("status")).toContainText(
        "4 cleaning services",
      );
    }
  }
  if (route === "/pricing") {
    for (const category of ["Residential", "Commercial"]) {
      await page.getByRole("button", { name: category, exact: true }).click();
      await expect(page.locator(".pricing-plan-card")).toHaveCount(4);
    }
  }
}
for (const slug of ["garden-cleaning", "carpet-cleaning"]) {
  await page.goto("http://localhost:4317/services/" + slug, {
    waitUntil: "networkidle",
  });
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]').first(),
  ).toHaveAttribute("content", /noindex/);
}
const sitemap = await (
  await page.request.get("http://localhost:4317/sitemap.xml")
).text();
if (/garden|carpet/i.test(sitemap)) throw Error("Retired service in sitemap");
for (const slug of slugs)
  if (!sitemap.includes("/services/" + slug))
    throw Error("Service missing in sitemap: " + slug);
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "Passed: category switches and correct cards at five widths, loaded images, no overflow; 16 public pages checked; retired services unavailable and removed from sitemap.",
);
await browser.close();
