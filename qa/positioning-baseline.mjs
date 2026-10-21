import fs from "node:fs";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";
const files = fs
  .readdirSync("src", { recursive: true })
  .filter((f) => fs.statSync("src/" + f).isFile());
const hashes = Object.fromEntries(
  files.map((f) => [
    f.replaceAll("\\", "/"),
    crypto
      .createHash("sha256")
      .update(fs.readFileSync("src/" + f))
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
const routes = {};
for (const route of ["/", "/about", "/pricing", "/contact", "/services"]) {
  await p.goto("http://localhost:4317" + route);
  await p.locator("h1").waitFor();
  await p.evaluate(() => document.fonts.ready);
  routes[route] = await p
    .locator("main")
    .evaluate((m) => ({
      sections: [...m.querySelectorAll("section")].map((n) => n.className),
      h1font: getComputedStyle(m.querySelector("h1")).font,
      buttons: [...m.querySelectorAll("a.button,button")]
        .slice(0, 5)
        .map((n) => ({
          class: n.className,
          bg: getComputedStyle(n).backgroundColor,
          radius: getComputedStyle(n).borderRadius,
        })),
      header: document.querySelector("header").className,
    }));
  await p.screenshot({
    path:
      "qa/positioning-before-" +
      (route.replaceAll("/", "-") || "home") +
      ".png",
    fullPage: true,
  });
}
fs.writeFileSync(
  "qa/positioning-baseline.json",
  JSON.stringify({ hashes, routes }, null, 2),
);
fs.copyFileSync("next-env.d.ts", "qa/positioning-next-env.txt");
await b.close();
console.log(
  "Initial working tree, source/style hashes and approved UI captured.",
);
