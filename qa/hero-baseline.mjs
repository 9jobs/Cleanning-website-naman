import fs from "node:fs";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";
const hashes = Object.fromEntries(
  ["src", "public/images"].flatMap((root) =>
    fs
      .readdirSync(root, { recursive: true })
      .filter((f) => fs.statSync(root + "/" + f).isFile())
      .map((f) => [
        root + "/" + f.replaceAll("\\", "/"),
        crypto
          .createHash("sha256")
          .update(fs.readFileSync(root + "/" + f))
          .digest("hex"),
      ]),
  ),
);
fs.writeFileSync(
  "qa/hero-baseline-files.json",
  JSON.stringify(hashes, null, 2),
);
fs.copyFileSync("next-env.d.ts", "qa/hero-next-env.txt");
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({ reducedMotion: "reduce" });
await p.goto("http://localhost:4317");
await p.evaluate(() => document.fonts.ready);
const baseline = {};
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.waitForTimeout(150);
  baseline[width] = await p.evaluate(() => {
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
    return {
      hero: rect(".carousel-hero"),
      content: rect(".carousel-content"),
      heading: rect("#home-title"),
      description: rect(".carousel-content>p"),
      actions: rect(".carousel-content .actions"),
      trust: rect(".carousel-benefits"),
      badge: rect(".carousel-caption"),
      quote: rect(".reference-lead"),
      header: document.querySelector("header").outerHTML,
      protected: [...document.querySelector("main").children]
        .filter((e) => !e.classList.contains("carousel-hero"))
        .map((e) => e.outerHTML),
    };
  });
  if ([390, 1440].includes(width))
    await p.screenshot({ path: `qa/hero-before-${width}.png` });
}
fs.writeFileSync(
  "qa/hero-baseline-layout.json",
  JSON.stringify(baseline, null, 2),
);
await b.close();
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(baseline).map(([w, d]) => [
        w,
        {
          hero: d.hero.height,
          heading: d.heading.height,
          paragraph: d.description.height,
          quoteY: d.quote.y,
        },
      ]),
    ),
  ),
);
