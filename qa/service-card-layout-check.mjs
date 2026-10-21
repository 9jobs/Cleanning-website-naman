import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({ reducedMotion: "reduce" });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.route("**/api/**", (r) =>
  r.request().method() === "POST" ? r.abort() : r.continue(),
);
await p.goto("http://localhost:4317");
await p.evaluate(() => document.fonts.ready);
const checks = [];
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await p.setViewportSize({ width, height: 1100 });
  await p.waitForTimeout(180);
  await p.locator(".service-showcase").scrollIntoViewIfNeeded();
  const cards = await p.locator(".service-tile").evaluateAll((es) =>
    es.map((e) => {
      const r = (n) => {
        const a = n.getBoundingClientRect();
        return {
          x: a.x,
          y: a.y,
          right: a.right,
          bottom: a.bottom,
          width: a.width,
          height: a.height,
        };
      };
      return {
        badge: r(e.querySelector(".service-tile-top")),
        copy: r(e.querySelector(".service-tile-copy")),
        title: r(e.querySelector("h3")),
        description: r(e.querySelector("p")),
        card: r(e),
        text: e.querySelector("p").innerText,
        href: e.querySelector("a").getAttribute("href"),
      };
    }),
  );
  for (const [i, c] of cards.entries()) {
    assert(
      c.badge.bottom + 8 < c.copy.y,
      `${width} card ${i + 1}: badge overlaps copy`,
    );
    assert(
      c.title.bottom <= c.description.y + 1,
      `${width} title overlaps paragraph`,
    );
    assert(
      c.description.bottom <= c.card.bottom - 10,
      `${width} copy spills outside card`,
    );
    assert(
      c.card.x >= -1 && c.card.right <= width + 1,
      `${width} horizontal overflow`,
    );
    assert(c.text.split(/\s+/).length <= 12);
    assert(c.href.startsWith("/services/"));
  }
  checks.push({ width, cards });
  if ([390, 1440].includes(width))
    await p
      .locator(".service-showcase")
      .screenshot({
        path: `qa/service-cards-fixed-${width}.png`,
        style:
          ".site-header,.skip-link,.back-to-top,nextjs-portal{visibility:hidden!important}",
      });
}
assert.deepEqual(errors, []);
await b.close();
fs.writeFileSync(
  "qa/service-card-layout-results.json",
  JSON.stringify({ checks, errors }, null, 2),
);
console.log(
  JSON.stringify({
    viewportWidths: checks.length,
    cardsChecked: checks.length * 6,
    badgeAndTextNoOverlap: true,
    shortDescriptions: true,
    errors,
  }),
);
