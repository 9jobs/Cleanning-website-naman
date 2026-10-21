import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { services, articles } from "../src/lib/data.ts";
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
await page.route("**/api/**", (r) =>
  r.request().method() === "POST" ? r.abort() : r.continue(),
);
const routes = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/contact",
  "/book",
  "/quote",
  "/reviews",
  "/blog",
  "/careers",
  "/service-areas",
  "/faq",
  ...services.map((s) => "/services/" + s.slug),
  ...articles.map((a) => "/blog/" + a.slug),
];
const report = [];
for (const route of routes) {
  const response = await page.goto("http://localhost:4317" + route);
  assert(response.status() < 400, route);
  await page.locator("h1").waitFor();
  const photos = await page.locator("main img").evaluateAll(async (es) =>
    Promise.all(
      es.map(async (e) => {
        e.loading = "eager";
        try {
          await e.decode();
        } catch {}
        const src = new URL(e.currentSrc || e.src);
        return {
          src: src.searchParams.get("url") || src.pathname,
          loaded: e.naturalWidth > 0,
        };
      }),
    ),
  );
  assert(
    photos.every((p) => p.loaded),
    "Image failed: " +
      route +
      " " +
      JSON.stringify(photos.filter((p) => !p.loaded)),
  );
  const names = photos.map((p) => p.src);
  assert.equal(
    new Set(names).size,
    names.length,
    "Repeated image within " + route,
  );
  report.push({ route, photos: photos.length });
}
assert.deepEqual(errors, []);
await browser.close();
fs.writeFileSync(
  "qa/site-photo-final-results.json",
  JSON.stringify({ pages: report, errors }, null, 2),
);
console.log(
  JSON.stringify({
    pages: report.length,
    images: report.reduce((n, p) => n + p.photos, 0),
    allImagesLoaded: true,
    noRepeatedImagesWithinPage: true,
    errors,
  }),
);
