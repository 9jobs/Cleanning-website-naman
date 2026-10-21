import fs from "node:fs";
import { chromium } from "@playwright/test";
import { services, articles } from "../src/lib/data.ts";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  reducedMotion: "reduce",
  viewport: { width: 1440, height: 1000 },
});
const report = {};
for (const route of [
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
]) {
  await p.goto("http://localhost:4317" + route);
  await p.locator("h1").waitFor();
  report[route] = await p
    .locator("main img")
    .evaluateAll((es) =>
      es.map((e) => ({
        src: e.getAttribute("src"),
        alt: e.alt,
        section: e.closest("section")?.className,
      })),
    );
}
fs.writeFileSync(
  process.argv[2] || "qa/site-photo-before.json",
  JSON.stringify(report, null, 2),
);
await b.close();
console.log(
  JSON.stringify({
    routes: Object.keys(report).length,
    placements: Object.values(report).reduce((n, a) => n + a.length, 0),
    byRoute: Object.fromEntries(
      Object.entries(report).map(([r, a]) => [r, a.length]),
    ),
  }),
);
