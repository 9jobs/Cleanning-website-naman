import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const errors = [];
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "no-preference",
});
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await p.route("**/api/**", (r) => r.abort());
const slugs = [
  "regular-house-cleaning",
  "deep-cleaning",
  "end-of-lease-cleaning",
  "commercial-cleaning",
  "airbnb-cleaning",
  "carpet-cleaning",
  "one-off-cleaning",
  "residential-cleaning",
  "office-cleaning",
  "window-cleaning",
  "oven-cleaning",
];
try {
  for (const slug of slugs) {
    await p.goto("http://localhost:4327/services/" + slug);
    await p.locator("h1").waitFor();
    for (
      let y = 0;
      y < (await p.evaluate(() => document.documentElement.scrollHeight));
      y += 650
    ) {
      await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
      await p.waitForTimeout(100);
    }
    await p.waitForTimeout(650);
    const broken = await p
      .locator("main img")
      .evaluateAll((ns) =>
        ns.filter((n) => !n.complete || n.naturalWidth === 0).map((n) => n.alt),
      );
    assert.deepEqual(broken, [], slug);
    const pending = await p
      .locator('main [data-reveal-state="pending"]')
      .count();
    assert.equal(pending, 0, slug + " hidden reveals");
  }
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto("http://localhost:4327/services");
  const menu = p.locator("header details.mega");
  await menu.locator("summary").click();
  const links = await menu
    .locator(".mega-links a")
    .evaluateAll((ns) => ns.map((n) => n.getAttribute("href")));
  assert.deepEqual(
    links,
    slugs.map((s) => "/services/" + s),
  );
  await menu
    .getByRole("link", { name: "Window Cleaning", exact: true })
    .click();
  await expect(p).toHaveURL(/services\/window-cleaning$/);
  await expect(menu).not.toHaveAttribute("open", "");
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto("http://localhost:4327/services/oven-cleaning");
  await p.getByRole("link", { name: "Get a Free Quote", exact: true }).click();
  await expect(p).toHaveURL(/quote\?service=oven-cleaning/);
  await expect(p.locator('select[name="service"]')).toHaveValue(
    "oven-cleaning",
  );
  await p.goto("http://localhost:4327/services/deep-cleaning");
  await p.getByRole("link", { name: "Request a Clean", exact: true }).click();
  await expect(p).toHaveURL(/book\?service=deep-cleaning/);
  await expect(p.getByRole("radio", { name: /^Deep Cleaning/ })).toBeChecked();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "qa/services-motion-report.json",
    JSON.stringify(
      {
        normalMotionPages: 11,
        brokenImages: 0,
        pendingReveals: 0,
        menuLinks: 11,
        bookingPreselection: true,
        quotePreselection: true,
        requestsSubmitted: 0,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS normal motion, all images, 11 menu targets, booking/quote preselection. No forms submitted.",
  );
} finally {
  await b.close();
}
