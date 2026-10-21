import fs from "node:fs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { chromium, expect } from "@playwright/test";
const base = "http://localhost:4317";
const catalogue = [
  ["house-cleaning", "House Cleaning"],
  ["property-cleaning", "Property Cleaning"],
  ["garden-cleaning", "Garden Cleaning"],
  ["construction-cleaning", "Construction Cleaning"],
  ["end-of-lease-cleaning", "End of Lease Cleaning"],
  ["commercial-cleaning", "Commercial Cleaning"],
  ["office-cleaning", "Office Cleaning"],
  ["airbnb-cleaning", "Airbnb Cleaning"],
  ["carpet-cleaning", "Carpet Cleaning"],
  ["window-cleaning", "Window Cleaning"],
  ["oven-cleaning", "Oven Cleaning"],
];
const guides = [
  "a-calm-weekly-cleaning-routine",
  "moving-out-cleaning-checklist",
  "garden-outdoor-cleaning-checklist",
  "post-construction-cleaning-scope",
  "prepare-property-after-renovation",
  "commercial-workplace-cleaning-checklist",
  "carpet-care-after-building-work",
  "residential-window-cleaning-tips",
];
const baseline = JSON.parse(
  fs.readFileSync("qa/positioning-baseline.json", "utf8"),
);
for (const [file, hash] of Object.entries(baseline.hashes)) {
  if (
    file.endsWith(".css") ||
    file.startsWith("app/api/") ||
    [
      "lib/contact-database.ts",
      "lib/contact-mail.ts",
      "lib/contact-validation.ts",
      "lib/validation.ts",
      "lib/server.ts",
      "components/motion.tsx",
    ].includes(file)
  )
    assert.equal(
      crypto
        .createHash("sha256")
        .update(fs.readFileSync("src/" + file))
        .digest("hex"),
      hash,
      file + " must be unchanged",
    );
}
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [],
  requests = [],
  report = {
    routes: [],
    sameStyles: true,
    sameSectionOrder: true,
    formsSubmitted: 0,
  };
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await p.route("**/api/**", (r) => {
  requests.push(r.request().method());
  return r.abort();
});
try {
  const routes = [
    "/",
    "/about",
    "/pricing",
    "/contact",
    "/services",
    "/faq",
    "/blog",
    ...catalogue.map(([slug]) => "/services/" + slug),
    ...guides.map((slug) => "/blog/" + slug),
  ];
  for (const route of routes) {
    const res = await p.goto(base + route);
    assert.equal(res.status(), 200, route);
    await p.locator("h1").waitFor();
    await p.evaluate(() => document.fonts.ready);
    assert.equal(await p.locator("h1").count(), 1, route);
    const widths = [];
    for (const width of [375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.waitForTimeout(100);
      const out = await p.locator("main").evaluate((m) =>
        [...m.querySelectorAll("*")]
          .filter((n) => {
            if (
              n.closest(
                '[aria-hidden="true"],.contact-quote-honeypot,.honeypot',
              )
            )
              return false;
            const r = n.getBoundingClientRect();
            return (
              r.width > 0 &&
              r.height > 0 &&
              (r.left < -1 || r.right > innerWidth + 1)
            );
          })
          .map((n) => ({
            tag: n.tagName,
            cls: n.className,
            left: n.getBoundingClientRect().left,
            right: n.getBoundingClientRect().right,
          }))
          .slice(0, 3),
      );
      assert.deepEqual(out, [], route + " overflow at " + width);
      widths.push(width);
    }
    if (baseline.routes[route]) {
      await p.setViewportSize({ width: 1440, height: 1000 });
      await p.waitForTimeout(150);
      const state = await p
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
      assert.deepEqual(
        state.sections,
        baseline.routes[route].sections,
        route + " section order",
      );
      assert.equal(
        state.h1font,
        baseline.routes[route].h1font,
        route + " heading style",
      );
      assert.deepEqual(
        state.buttons,
        baseline.routes[route].buttons,
        route + " button styles",
      );
    }
    const imgs = await p
      .locator("main img")
      .evaluateAll((ns) =>
        ns.map((n) => ({ src: n.getAttribute("src"), alt: n.alt })),
      );
    assert.ok(
      imgs.every((n) => n.src.includes(".webp") && n.alt.trim().length > 3),
      route + " WebP/alt",
    );
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.evaluate(() => {
      document.activeElement?.blur();
      scrollTo({ top: 0, behavior: "instant" });
    });
    await p.waitForTimeout(80);
    await p.screenshot({
      path:
        "qa/positioning-final-" +
        (route.replaceAll("/", "-") || "home") +
        "-1440.png",
      fullPage: true,
    });
    if (
      [
        "/",
        "/about",
        "/pricing",
        "/contact",
        "/services",
        "/services/garden-cleaning",
        "/services/construction-cleaning",
      ].includes(route)
    ) {
      await p.setViewportSize({ width: 390, height: 844 });
      await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await p.waitForTimeout(80);
      await p.screenshot({
        path:
          "qa/positioning-final-" +
          (route.replaceAll("/", "-") || "home") +
          "-390.png",
        fullPage: true,
      });
    }
    report.routes.push({ route, widths });
    console.log("PASS " + route);
  }
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto(base + "/");
  await expect(p.locator("h1")).toContainText("A cleaner property.");
  const menu = p.locator("header details.mega");
  await menu.locator("summary").click();
  for (const [slug, name] of catalogue)
    await expect(menu.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      "/services/" + slug,
    );
  await menu
    .getByRole("link", { name: "Garden Cleaning", exact: true })
    .click();
  await expect(p.locator("h1")).toHaveText("Garden Cleaning");
  await p.goto(base + "/contact");
  await p.waitForTimeout(500);
  const select = p.locator('select[name="service"]');
  for (const [slug, name] of catalogue) {
    await select.selectOption(slug);
    await expect(select.locator("option:checked")).toHaveText(name);
  }
  await expect(
    p.getByRole("button", { name: "Get My Free Quote", exact: true }),
  ).toBeEnabled();
  await p.goto(base + "/");
  await p.waitForTimeout(350);
  for (const name of ["Property", "Garden", "Construction"]) {
    await p
      .getByRole("group", { name: "Comparison cleaning area" })
      .getByRole("button", { name, exact: true })
      .click();
    await expect(p.locator(".comparison-sheet img").first()).toHaveAttribute(
      "alt",
      new RegExp(name.toLowerCase()),
    );
    const slider = p.getByRole("slider", {
      name: "Compare before and after cleaning images",
    });
    await slider.fill("70");
    await expect(p.locator(".comparison-after")).toHaveAttribute(
      "style",
      /70%/,
    );
  }
  await expect(
    p.getByText(
      "Illustrative comparison. Actual results depend on the condition of the property.",
    ),
  ).toBeVisible();
  await p.goto(base + "/services/property-cleaning");
  await p.waitForTimeout(350);
  const tabs = p.getByRole("tab");
  await tabs.nth(0).focus();
  await tabs.nth(0).press("End");
  await expect(tabs.nth(2)).toBeFocused();
  await tabs.nth(2).press("Home");
  await expect(tabs.nth(0)).toBeFocused();
  await tabs.nth(0).press("ArrowRight");
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  for (const [slug] of catalogue) {
    await p.goto(base + "/services/" + slug);
    const faq = p.locator("main button[aria-expanded]");
    assert.equal(await faq.count(), 3);
    await faq.first().click();
    await expect(faq.first()).toHaveAttribute("aria-expanded", "true");
  }
  await p.setViewportSize({ width: 390, height: 844 });
  await p.getByRole("button", { name: "Open navigation", exact: true }).click();
  await p
    .getByRole("navigation", { name: "Mobile navigation", exact: true })
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await expect(p).toHaveURL(base + "/services");
  assert.equal(await p.locator('main a[href^="/services/"]').count(), 11);
  await p.goto(base + "/quote?service=garden-cleaning");
  await expect(p.locator('select[name="service"]')).toHaveValue(
    "garden-cleaning",
  );
  await p.goto(base + "/book?service=construction-cleaning");
  await expect(
    p.getByRole("radio", { name: /^Construction Cleaning/ }),
  ).toBeChecked();
  for (const [old, canonical] of [
    ["regular-house-cleaning", "house-cleaning"],
    ["deep-cleaning", "property-cleaning"],
    ["one-off-cleaning", "garden-cleaning"],
    ["residential-cleaning", "construction-cleaning"],
  ]) {
    await p.goto(base + "/services/" + old);
    await expect(p).toHaveURL(base + "/services/" + canonical);
  }
  assert.deepEqual(errors, []);
  assert.equal(requests.filter((m) => m === "POST").length, 0);
  Object.assign(report, {
    errors,
    serviceOptions: 11,
    menuLinks: 11,
    comparisonCategories: 3,
    blogGuides: 8,
    keyboardTabs: true,
    legacyLinks: true,
  });
  fs.writeFileSync(
    "qa/positioning-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log("PASS all positioning checks; no forms submitted.");
} finally {
  await b.close();
}
