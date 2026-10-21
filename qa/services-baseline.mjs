import fs from "node:fs";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";
const files = fs
  .readdirSync("src", { recursive: true })
  .filter((p) => fs.statSync("src/" + p).isFile());
const hashes = Object.fromEntries(
  files.map((p) => [
    p.replaceAll("\\", "/"),
    crypto
      .createHash("sha256")
      .update(fs.readFileSync("src/" + p))
      .digest("hex"),
  ]),
);
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const pages = {};
for (const route of [
  "/",
  "/about",
  "/pricing",
  "/contact",
  "/services/regular-house-cleaning",
  "/services",
]) {
  await p.goto("http://localhost:4317" + route);
  await p.locator("h1").waitFor();
  await p.evaluate(() => document.fonts.ready);
  pages[route] = await p.evaluate(() => ({
    text: document.querySelector("main").innerText,
    header: document.querySelector("header").outerHTML,
    footer: document.querySelector("footer").outerHTML,
    h1: getComputedStyle(document.querySelector("h1")).cssText,
    boxes: [
      document.querySelector("h1"),
      document.querySelector("header"),
      document.querySelector("footer"),
    ].map((n) => {
      const r = n.getBoundingClientRect();
      const s = getComputedStyle(n);
      return {
        width: r.width,
        height: r.height,
        font: s.font,
        color: s.color,
        background: s.backgroundColor,
      };
    }),
  }));
  await p.screenshot({
    path:
      "qa/services-before-" + (route.replaceAll("/", "-") || "home") + ".png",
    fullPage: true,
  });
}
fs.writeFileSync(
  "qa/services-baseline.json",
  JSON.stringify({ hashes, pages }, null, 2),
);
await b.close();
console.log("Baseline captured: source hashes and six local pages.");
