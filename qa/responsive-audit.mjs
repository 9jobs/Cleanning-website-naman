import fs from "node:fs/promises";
import { chromium, webkit } from "@playwright/test";
import { services, articles } from "../src/lib/data.ts";

const phase = process.argv[2] || "before";
const widths = [320, 360, 375, 390, 393, 412, 414, 430, 480, 600, 768, 810, 820, 834, 912, 1024, 1280, 1366, 1440, 1536, 1600, 1728, 1920, 2560];
const canonical = ["/", "/about", "/pricing", "/contact", "/services", "/areas", "/reviews", "/faq", "/blog", "/careers", "/privacy", "/terms", "/book/confirmation", "/quote/confirmation", ...services.map((s) => `/services/${s.slug}`), ...articles.map((a) => `/blog/${a.slug}`)];
const aliases = ["/book", "/quote?service=end-of-lease-cleaning", "/services/regular-house-cleaning", "/services/deep-cleaning", "/services/one-off-cleaning", "/services/residential-cleaning", "/blog/kitchen-reset-guide", "/responsive-not-found-check"];
const selected = process.env.RESPONSIVE_ROUTES ? process.env.RESPONSIVE_ROUTES.split(",") : canonical;
await fs.mkdir(`qa/responsive-${phase}`, { recursive: true });
const browser = process.env.RESPONSIVE_ENGINE === "webkit"
  ? await webkit.launch({ headless: true })
  : await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", (error) => errors.push({ route: new URL(page.url()).pathname, message: error.message }));
await page.route("**/api/**", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
const results = [];
const desktop = [];
const screenshotStyle = "nextjs-portal,.back-top{visibility:hidden!important}";

async function prepare(route) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const response = await page.goto(`http://localhost:4317${route}`);
  if (route === "/book" || route.startsWith("/quote?")) await page.waitForURL("**/contact**");
  if (route.startsWith("/services/") && ["regular-house-cleaning", "deep-cleaning", "one-off-cleaning", "residential-cleaning"].some((slug) => route.endsWith(slug))) await page.waitForURL((url) => url.pathname !== route);
  if (route === "/blog/kitchen-reset-guide") await page.waitForURL((url) => url.pathname !== route);
  await page.locator("main").waitFor();
  await page.evaluate(() => document.fonts.ready);
  const pause = page.getByRole("button", { name: "Pause banner autoplay", exact: true });
  if (await pause.count()) {
    await pause.focus();
    await page.keyboard.press("Enter");
    await page.locator(".carousel-hero > button").evaluate((element) => element.blur());
  }
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 850) {
      scrollTo(0, y);
      await new Promise(requestAnimationFrame);
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(180);
  return response?.status();
}

async function geometry() {
  return page.evaluate(() => {
    const width = innerWidth;
    function clipped(element) {
      for (let p = element.parentElement; p && p !== document.body; p = p.parentElement) {
        const css = getComputedStyle(p);
        if (["hidden", "clip", "auto", "scroll"].includes(css.overflowX)) return true;
      }
      return false;
    }
    const overflow = [];
    const textClips = [];
    const nodes = document.querySelectorAll("header, main, footer, main section, main div, main h1, main h2, main h3, main p, main li, main a, main button, main input, main select, main textarea, footer a, footer li");
    for (const element of nodes) {
      const css = getComputedStyle(element);
      const r = element.getBoundingClientRect();
      if (!r.width || !r.height || css.display === "none" || css.visibility === "hidden" || Number(css.opacity) < 0.05) continue;
      const selector = element.tagName.toLowerCase() + (element.className && typeof element.className === "string" ? "." + element.className.trim().split(/\s+/).join(".") : "");
      if ((r.left < -2 || r.right > width + 2) && !clipped(element)) overflow.push({ selector, left: Math.round(r.left), right: Math.round(r.right), text: element.textContent.trim().slice(0, 90) });
      if (/^H[1-6]$|^P$/.test(element.tagName) && element.scrollWidth > element.clientWidth + 3) textClips.push({ selector, width: element.clientWidth, scroll: element.scrollWidth, text: element.textContent.trim().slice(0, 90) });
    }
    const hero = document.querySelector(".carousel-hero");
    let heroClipped = null;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const children = [...hero.querySelectorAll("h1, .carousel-content p, .actions, .carousel-benefits")];
      const bottom = Math.max(...children.map((e) => e.getBoundingClientRect().bottom));
      if (bottom > rect.bottom + 2) heroClipped = { contentBottom: bottom, heroBottom: rect.bottom };
    }
    return { scrollWidth: document.documentElement.scrollWidth, viewport: width, overflow: overflow.slice(0, 18), textClips: textClips.slice(0, 12), heroClipped };
  });
}

for (const route of selected) {
  const status = await prepare(route);
  const slug = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "--");
  if (["before", "after"].includes(phase) && !process.env.RESPONSIVE_ROUTES) {
    await page.screenshot({ path: `qa/responsive-${phase}/${slug}-1440.png`, fullPage: true, animations: "disabled", style: screenshotStyle });
    desktop.push({ route, width: 1440, file: `${slug}-1440.png` });
    if (["/", "/about", "/pricing", "/contact", "/services", "/services/house-cleaning", "/services/garden-cleaning"].includes(route)) {
      await page.setViewportSize({ width: 1920, height: 1000 });
      await page.screenshot({ path: `qa/responsive-${phase}/${slug}-1920.png`, fullPage: true, animations: "disabled", style: screenshotStyle });
      desktop.push({ route, width: 1920, file: `${slug}-1920.png` });
    }
  }
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await page.waitForTimeout(70);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    results.push({ route, status, width, height: width < 600 ? 844 : 1000, ...await geometry() });
  }
  for (const [width, height] of [[667, 375], [844, 390], [1024, 768], [1366, 1024]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(70);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    results.push({ route, status, width, height, landscape: true, ...await geometry() });
  }
  console.log(`${phase}: ${results.length} viewport checks; ${route}`);
  await fs.writeFile(`qa/responsive-${phase}-results.json`, JSON.stringify({ results, desktop, errors }, null, 2));
}
const redirects = [];
if (!process.env.RESPONSIVE_ROUTES) {
  for (const route of aliases) {
    const status = await prepare(route);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(100);
    redirects.push({ route, status, destination: new URL(page.url()).pathname, ...await geometry() });
  }
}
await browser.close();
const issues = results.filter((r) => r.scrollWidth > r.width + 1 || r.overflow.length || r.textClips.length || r.heroClipped);
await fs.writeFile(`qa/responsive-${phase}-results.json`, JSON.stringify({ results, desktop, redirects, errors }, null, 2));
console.log(JSON.stringify({ phase, routes: selected.length, viewportChecks: results.length, issues: issues.length, errors }));
