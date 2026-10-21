import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";
import { heroSlides } from "../src/components/hero-slides.ts";
const baseline = JSON.parse(
  fs.readFileSync("qa/hero-baseline-layout.json", "utf8"),
);
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({ reducedMotion: "reduce" });
await p.clock.install();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await p.route("**/api/**", (r) =>
  r.request().method() === "POST" ? r.abort() : r.continue(),
);
await p.goto("http://localhost:4317");
await p.evaluate(() => document.fonts.ready);
await p.mouse.move(0, 0);
await p.clock.pauseAt(await p.evaluate(() => Date.now() + 1000));
const checks = [];
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.waitForTimeout(180);
  for (const slide of heroSlides) {
    if (slide.id !== "house-cleaning") await p.clock.fastForward(6500);
    await p.waitForTimeout(220);
    await p
      .locator(`.carousel-hero[data-active-service="${slide.id}"]`)
      .waitFor();
    await p
      .locator(".carousel-photo.is-active img")
      .evaluate((img) => img.decode());
    const d = await p.evaluate(() => {
      const rect = (s) => {
        const e = document.querySelector(s),
          r = e.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          font: getComputedStyle(e).font,
        };
      };
      const hero = document.querySelector(".carousel-hero");
      return {
        hero: rect(".carousel-hero"),
        heading: rect("#home-title"),
        actions: rect(".carousel-content .actions"),
        trust: rect(".carousel-benefits"),
        quote: rect(".reference-lead"),
        title: hero.querySelector("h1").innerText,
        copy: hero.querySelector(".carousel-content>p").innerText,
        trustText: [...hero.querySelectorAll(".carousel-benefits>span")].map(
          (e) => e.innerText,
        ),
        image: hero
          .querySelector(".carousel-photo.is-active img")
          .getAttribute("src"),
        links: [...hero.querySelectorAll(".actions a")].map((e) => ({
          text: e.innerText,
          href: e.getAttribute("href"),
        })),
        header: document.querySelector("header").outerHTML,
        protected: [...document.querySelector("main").children]
          .filter((e) => !e.classList.contains("carousel-hero"))
          .map((e) => e.outerHTML),
        removed: !hero.querySelector(
          '.carousel-eyebrow,.carousel-caption,[role="group"]',
        ),
        overflow: [...hero.querySelectorAll("h1,p,a,.carousel-benefits>span")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 1 && (r.left < -1 || r.right > innerWidth + 1);
          })
          .map((e) => e.className),
        zoom: getComputedStyle(hero.querySelector(".is-active img"))
          .animationName,
      };
    });
    assert.equal(d.title, `${slide.titleLine1}\n${slide.titleLine2}`);
    assert.equal(d.copy, slide.description);
    assert.equal(d.image, slide.image);
    assert.deepEqual(d.trustText, [...slide.trustItems]);
    assert.deepEqual(d.links, [
      { text: slide.primaryCta, href: slide.primaryHref },
      { text: slide.secondaryCta, href: slide.secondaryHref },
    ]);
    assert(d.removed);
    assert.equal(d.zoom, "none");
    assert.deepEqual(d.overflow, []);
    assert.equal(d.header, baseline[width].header);
    const expectedReduction = width <= 600 ? 69 : width <= 900 ? 81 : 0;
    for (const k of ["hero", "heading", "actions", "trust", "quote"]) {
      const hDelta = d[k].height - baseline[width][k].height;
      const yDelta = d[k].y - baseline[width][k].y;
      assert(
        Math.abs(hDelta + (k === "hero" ? expectedReduction : 0)) < 0.2,
        `height changed ${width} ${slide.id} ${k}: ${hDelta}`,
      );
      assert(
        Math.abs(yDelta + (k === "quote" ? expectedReduction : 0)) < 0.2,
        `position changed ${width} ${slide.id} ${k}: ${yDelta}`,
      );
    }
    const normalise = (html) =>
      html
        .replaceAll(' data-reveal-state="visible"', "")
        .replaceAll(' style=""', "");
    assert.deepEqual(
      d.protected.map(normalise),
      baseline[width].protected.map(normalise),
      "non-hero markup changed",
    );
    checks.push({
      width,
      slide: slide.id,
      heroHeight: d.hero.height,
      quoteY: d.quote.y,
      protectedUnchanged: true,
    });
    if ([390, 1440, 1920].includes(width))
      await p.screenshot({ path: `qa/hero-final-${width}-${slide.id}.png` });
  }
  await p.clock.fastForward(6500);
  await p.waitForTimeout(30);
}
await b.close();
const hashes = JSON.parse(
  fs.readFileSync("qa/hero-baseline-files.json", "utf8"),
);
const changed = Object.entries(hashes)
  .filter(
    ([f, h]) =>
      crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex") !==
      h,
  )
  .map(([f]) => f);
assert.deepEqual(changed, ["src/components/home-carousel.tsx"]);
assert.deepEqual(errors, []);
fs.writeFileSync(
  "qa/hero-final-layout-results.json",
  JSON.stringify({ checks, errors, changed }, null, 2),
);
console.log(
  JSON.stringify(
    {
      layouts: checks.length,
      errors,
      changed,
      protectedUnchanged: checks.every((c) => c.protectedUnchanged),
    },
    null,
    2,
  ),
);
