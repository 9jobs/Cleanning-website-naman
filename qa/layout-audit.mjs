import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const stage = process.argv[2] || "after";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: "reduce",
});
const report = { stage, widths: [], errors: [] };
page.on("pageerror", (e) => report.errors.push(e.message));
await page.goto("http://127.0.0.1:4317");
await expect(page.locator(".reference-hero h1")).toBeVisible();
await page.evaluate(() => document.fonts.ready);
report.identity = await page.evaluate(() => ({
  headings: [...document.querySelectorAll("main h1,main h2,main h3")].map(
    (e) => e.textContent,
  ),
  links: [...document.querySelectorAll("a")].map((e) => e.getAttribute("href")),
  images: [...document.images].map((e) => {
    const u = new URL(e.src);
    return u.searchParams.get("url") || u.pathname;
  }),
  cards: [
    ...document.querySelectorAll(
      ".pricing-path,.service-tile,.intro-image-message,.intro-image-care",
    ),
  ].map((e) => {
    const s = getComputedStyle(e);
    return {
      class: e.className,
      font: s.fontFamily,
      color: s.color,
      background: s.backgroundImage,
      radius: s.borderRadius,
      shadow: s.boxShadow,
    };
  }),
}));
for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920, 2560]) {
  await page.setViewportSize({ width, height: 1080 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const audit = await page.evaluate(() => ({
    viewport: innerWidth,
    dpr: devicePixelRatio,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    root: {
      zoom: getComputedStyle(document.documentElement).zoom,
      transform: getComputedStyle(document.documentElement).transform,
    },
    sections: [...document.querySelectorAll("main>section")].map((e) => {
      const b = e.getBoundingClientRect();
      const c = e.querySelector(".container") || e;
      const cb = c.getBoundingClientRect();
      return {
        class: e.className,
        height: Math.round(b.height),
        contentWidth: Math.round(cb.width),
        left: Math.round(cb.left),
        font: getComputedStyle(e.querySelector("h2") || e).fontSize,
      };
    }),
    clipped: [
      ...document.querySelectorAll(
        ".pricing-path h3,.pricing-path p,.pricing-path a.button,.service-tile-copy",
      ),
    ]
      .filter((e) => {
        const b = e.getBoundingClientRect(),
          p = e.closest(".pricing-path,.service-tile").getBoundingClientRect();
        return (
          b.left < p.left - 1 ||
          b.right > p.right + 1 ||
          b.top < p.top - 1 ||
          b.bottom > p.bottom + 1
        );
      })
      .map((e) => e.textContent),
  }));
  report.widths.push(audit);
  if (stage === "after") {
    expect(audit.overflow, `page overflow at ${width}`).toBe(false);
    expect(audit.clipped, `card text at ${width}`).toEqual([]);
  }
}
for (const [width, name] of [
  [1920, "desktop"],
  [390, "mobile"],
]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const section of await page.locator("main>section").all())
    await section.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `qa/layout-${stage}-${name}.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `qa/layout-${stage}-${name}-top.png` });
}
if (stage === "after") {
  const previous = JSON.parse(
    await fs.readFile("qa/layout-before.json", "utf8"),
  );
  expect(report.identity).toEqual(previous.identity);
  expect(report.errors).toEqual([]);
}
await fs.writeFile(`qa/layout-${stage}.json`, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({
    stage,
    widths: report.widths.map((a) => ({
      width: a.viewport,
      overflow: a.overflow,
      clipped: a.clipped.length,
      containers: a.sections.slice(0, 8).map((s) => s.contentWidth),
    })),
    errors: report.errors,
  }),
);
await browser.close();
