import fs from "node:fs";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await p.route("**/api/**", (r) => r.abort());
try {
  await p.goto("http://localhost:4317/");
  await expect(p.locator(".carousel-caption strong")).toHaveText(
    "House & Property Cleaning",
  );
  await p.waitForTimeout(6200);
  await expect(p.locator(".carousel-caption strong")).toHaveText(
    "Garden & Outdoor Cleaning",
  );
  await p.waitForTimeout(6100);
  await expect(p.locator(".carousel-caption strong")).toHaveText(
    "Construction & Post-Build Cleaning",
  );
  await p.getByRole("button", { name: "Pause banner autoplay" }).focus();
  await p.getByRole("button", { name: "Pause banner autoplay" }).press("Enter");
  await p.locator(".comparison-section").scrollIntoViewIfNeeded();
  await p
    .getByRole("group", { name: "Comparison cleaning area" })
    .getByRole("button", { name: "Garden", exact: true })
    .click();
  await p.locator(".comparison input").fill("50");
  await p.waitForTimeout(700);
  await p
    .locator(".comparison-wrap")
    .screenshot({ path: "qa/positioning-garden-comparison.png" });
  for (const route of [
    "/",
    "/about",
    "/services/garden-cleaning",
    "/services/construction-cleaning",
    "/services/property-cleaning",
  ]) {
    await p.goto("http://localhost:4317" + route);
    await p.waitForTimeout(750);
    for (
      let y = 0;
      y < (await p.evaluate(() => document.documentElement.scrollHeight));
      y += 450
    ) {
      await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
      await p.waitForTimeout(150);
    }
    await p.waitForTimeout(1100);
    assert.deepEqual(
      await p
        .locator("main img")
        .evaluateAll((ns) =>
          ns.filter((n) => !n.complete || !n.naturalWidth).map((n) => n.alt),
        ),
      [],
      route + " image loading",
    );
    assert.equal(
      await p.locator('main [data-reveal-state="pending"]').count(),
      0,
      route + ' pending reveals: ' + JSON.stringify(await p.locator('main [data-reveal-state="pending"]').evaluateAll(ns => ns.map(n => n.innerText.slice(0,80)))),
    );
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "qa/positioning-motion-report.json",
    JSON.stringify(
      {
        autoplaySlides: 3,
        comparisonDrag: true,
        normalMotionPages: 5,
        brokenImages: 0,
        consoleErrors: errors,
        productionWrites: 0,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS 3-slide autoplay, comparison slider, normal motion and loaded images.",
  );
} finally {
  await b.close();
}
