import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { chromium, expect } from "@playwright/test";
const base = process.env.SERVICES_QA_BASE || "http://localhost:4317";
const slugs = [
  "regular-house-cleaning",
  "deep-cleaning",
  "end-of-lease-cleaning",
  "commercial-cleaning",
  "airbnb-cleaning",
  "carpet-cleaning",
  "one-off-cleaning",
  "residential-cleaning",
  "office-cleaning",
  "window-cleaning",
  "oven-cleaning",
];
const routes = ["/services", ...slugs.map((s) => "/services/" + s)];
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
await p.route("**/api/**", (route) => route.abort());
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const report = { routes: [], protected: [], errors };
try {
  for (const route of routes) {
    const res = await p.goto(base + route);
    assert.equal(res.status(), 200, route);
    await p.locator("h1").waitFor();
    await p.evaluate(() => document.fonts.ready);
    assert.equal(await p.locator("h1").count(), 1, route);
    const pageImages = await p
      .locator("main img")
      .evaluateAll((images) =>
        images.map((i) => ({ alt: i.alt, src: i.getAttribute("src") })),
      );
    assert.ok(pageImages.every((i) => i.alt.length > 10));
    const widths = [];
    for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await p.setViewportSize({ width, height: 1000 });
      const overflow = await p.locator("main").evaluate((main) =>
        [...main.querySelectorAll("*")]
          .filter((n) => {
            const r = n.getBoundingClientRect(),
              s = getComputedStyle(n);
            return (
              r.width > 0 &&
              r.height > 0 &&
              s.visibility !== "hidden" &&
              (r.left < -1 || r.right > innerWidth + 1)
            );
          })
          .map((n) => ({
            tag: n.tagName,
            cls: n.className,
            left: n.getBoundingClientRect().left,
            right: n.getBoundingClientRect().right,
          }))
          .slice(0, 5),
      );
      assert.deepEqual(overflow, [], `${route} at ${width}: overflow`);
      widths.push(width);
    }
    await p.setViewportSize({ width: 1440, height: 1000 });
    if (route != "/services") {
      const questions = p.locator("main button[aria-expanded]");
      assert.equal(await questions.count(), 3);
      for (let i = 0; i < 3; i++) {
        await questions.nth(i).click();
        await expect(questions.nth(i)).toHaveAttribute("aria-expanded", "true");
        const id = await questions.nth(i).getAttribute("aria-controls");
        await expect(p.locator('[id="' + id + '"]')).toBeVisible();
        await questions.nth(i).press("Enter");
        await expect(questions.nth(i)).toHaveAttribute(
          "aria-expanded",
          "false",
        );
      }
      const anchor = p.getByRole("link", {
        name: "Explore the cleaning scope",
      });
      await anchor.click();
      assert.equal(await p.locator("#cleaning-scope").count(), 1);
      const hrefs = await p
        .locator("main a[href]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")));
      assert.ok(hrefs.includes("/book?service=" + route.split("/").at(-1)));
      assert.ok(hrefs.includes("/quote?service=" + route.split("/").at(-1)));
    }
    if (route.endsWith("deep-cleaning")) {
      const tabs = p.getByRole("tab");
      await tabs.nth(1).click();
      await expect(p.getByRole("tabpanel")).toContainText(
        "Bathroom: the details matter.",
      );
      await tabs.nth(1).press("ArrowRight");
      await expect(tabs.nth(2)).toBeFocused();
      await expect(p.getByRole("tabpanel")).toContainText(
        "Living areas: the details matter.",
      );
      await tabs.nth(2).press("Home");
      await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    }
    if (route === "/services") {
      assert.equal(await p.locator('main a[href^="/services/"]').count(), 11);
      for (const [label, count] of [
        ["Home", 5],
        ["Business", 3],
        ["Specialist", 3],
        ["All services", 11],
      ]) {
        await p.getByRole("button", { name: label, exact: true }).click();
        assert.equal(
          await p.locator('main a[href^="/services/"]').count(),
          count,
        );
      }
    }
    await p.evaluate(() => {
      document.activeElement?.blur();
      scrollTo({ top: 0, behavior: "instant" });
    });
    await p.waitForTimeout(80);
    await p.screenshot({
      path: "qa/services-final-" + route.split("/").at(-1) + "-1440.png",
      fullPage: true,
    });
    await p.setViewportSize({ width: 390, height: 844 });
    await p.evaluate(() => {
      document.activeElement?.blur();
      scrollTo({ top: 0, behavior: "instant" });
    });
    await p.waitForTimeout(100);
    await p.screenshot({
      path: "qa/services-final-" + route.split("/").at(-1) + "-390.png",
      fullPage: true,
    });
    report.routes.push({
      route,
      widths,
      images: pageImages.length,
      interactive: true,
    });
    console.log("PASS " + route);
  }
  const baseline = JSON.parse(
    fs.readFileSync("qa/services-baseline.json", "utf8"),
  );
  for (const route of ["/", "/about", "/pricing", "/contact"]) {
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(base + route);
    await p.locator("h1").waitFor();
    await p.evaluate(() => document.fonts.ready);
    const after = await p.evaluate(() => ({
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
    const before = structuredClone(baseline.pages[route]);
    const normalise = (text) =>
      text.replace(
        /(?:Start|Pause) banner autoplay/g,
        "Banner autoplay control",
      );
    after.text = normalise(after.text);
    before.text = normalise(before.text);
    assert.deepEqual(after, before, route + " protected regression");
    report.protected.push(route);
  }
  const changed = Object.entries(baseline.hashes)
    .filter(
      ([file, hash]) =>
        crypto
          .createHash("sha256")
          .update(fs.readFileSync("src/" + file))
          .digest("hex") !== hash,
    )
    .map(([file]) => file);
  assert.deepEqual(changed, ["app/services/[slug]/page.tsx"]);
  report.existingSourceChanges = changed;
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "qa/services-final-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    "PASS 96 responsive layouts, interactions, protected-page DOM/styles and source scope.",
  );
} finally {
  await b.close();
}
