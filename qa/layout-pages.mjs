import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  reducedMotion: "reduce",
});
const report = { responsive: [], motion: [], errors: [] };
page.on("pageerror", (e) => report.errors.push(e.message));
const routes = [
  "/about",
  "/services",
  "/pricing",
  "/areas",
  "/reviews",
  "/faq",
  "/contact",
  "/book",
  "/careers",
  "/blog",
  "/privacy",
  "/terms",
  "/quote",
  "/services/deep-cleaning",
  "/blog/kitchen-reset-guide",
];
for (const width of [375, 768, 1024, 1440, 1920, 2560]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of routes) {
    const response = await page.goto("http://127.0.0.1:4317" + route);
    await expect(page.locator("h1")).toBeVisible();
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      width: document.querySelector("main .container")?.getBoundingClientRect()
        .width,
      rootZoom: getComputedStyle(document.documentElement).zoom,
    }));
    expect(response.status()).toBe(200);
    expect(metrics.overflow, `${route} at ${width}`).toBe(false);
    expect(metrics.rootZoom).toBe("1");
    report.responsive.push({ route, viewport: width, ...metrics });
  }
}
await page.setViewportSize({ width: 1920, height: 1080 });
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.goto("http://127.0.0.1:4317");
await expect(page.locator("h1")).toBeVisible();
for (const section of await page.locator("main>section").all()) {
  await section.scrollIntoViewIfNeeded();
  for (const reveal of await section.locator(".motion-reveal").all()) {
    await reveal.scrollIntoViewIfNeeded();
    await expect(reveal).toHaveAttribute("data-reveal-state", "visible", {
      timeout: 6000,
    });
  }
  const values = await section.evaluate((el) => ({
    class: el.className,
    wrappers: [
      ...el.querySelectorAll('.motion-reveal[data-reveal-state="visible"]'),
    ].map((e) => {
      const s = getComputedStyle(e),
        m = new DOMMatrixReadOnly(
          s.transform === "none" ? undefined : s.transform,
        );
      return {
        opacity: s.opacity,
        scaleX: m.a,
        scaleY: m.d,
        translateX: m.e,
        translateY: m.f,
      };
    }),
    height: el.getBoundingClientRect().height,
  }));
  for (const wrapper of values.wrappers) {
    expect(wrapper.opacity).toBe("1");
    expect(wrapper.scaleX).toBeCloseTo(1, 3);
    expect(wrapper.scaleY).toBeCloseTo(1, 3);
    expect(wrapper.translateX).toBeCloseTo(0, 2);
    expect(wrapper.translateY).toBeCloseTo(0, 2);
  }
  report.motion.push(values);
  const name = values.class.replace(/[^a-z0-9]+/gi, "-");
  await section.screenshot({
    path: `qa/aligned-${name}.png`,
    animations: "disabled",
  });
}
await page.locator("footer").scrollIntoViewIfNeeded();
await page.locator("footer").screenshot({ path: "qa/aligned-footer.png" });
expect(report.errors).toEqual([]);
await fs.writeFile("qa/layout-pages.json", JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({
    responsive: report.responsive.length,
    sections: report.motion.length,
    errors: report.errors,
  }),
);
await browser.close();
