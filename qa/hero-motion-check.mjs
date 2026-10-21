import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.route("**/api/**", (r) =>
  r.request().method() === "POST" ? r.abort() : r.continue(),
);
const scale = () =>
  p
    .locator(".carousel-photo.is-active img")
    .evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
const firstLoads = [];
for (let i = 0; i < 2; i++) {
  if (i === 0) await p.goto("http://localhost:4317");
  else await p.reload();
  await p.evaluate(() => document.fonts.ready);
  await p.locator(".carousel-photo.is-active img").evaluate((e) => e.decode());
  await p.mouse.move(0, 0);
  const start = await scale();
  await p.waitForTimeout(1500);
  const later = await scale();
  assert(
    later > start + 0.001,
    `zoom did not run on ${i ? "refresh" : "opening"}: ${start} ${later}`,
  );
  firstLoads.push({ event: i ? "refresh" : "opening", start, later });
}
const zoomOut = await p
  .locator(".carousel-photo.is-active img")
  .evaluate((e) => {
    const animation = e
      .getAnimations()
      .find((a) => a.animationName?.includes("hero-ken-burns"));
    animation.pause();
    animation.currentTime = 6500;
    const peak = new DOMMatrix(getComputedStyle(e).transform).a;
    animation.currentTime = 12000;
    const end = new DOMMatrix(getComputedStyle(e).transform).a;
    animation.play();
    return { peak, end };
  });
assert(zoomOut.peak > zoomOut.end + 0.03);
await p.clock.install();
await p.clock.pauseAt(await p.evaluate(() => Date.now() + 1000));
const active = () =>
  p.locator(".carousel-hero").getAttribute("data-active-service");
const first = await active();
await p.locator("#home-title").hover();
await p.clock.fastForward(14000);
assert.equal(await active(), first);
await p.mouse.move(0, 0);
await p.clock.fastForward(6400);
assert.equal(await active(), first);
await p.clock.fastForward(110);
await p.waitForTimeout(30);
assert.notEqual(await active(), first);
const focusedSlide = await active();
await p.locator(".carousel-content .actions a").first().focus();
await p.clock.fastForward(14000);
assert.equal(await active(), focusedSlide);
await p.evaluate(() => document.activeElement.blur());
await p.clock.fastForward(6510);
await p.waitForTimeout(30);
assert.notEqual(await active(), focusedSlide);
const beforeHidden = await active();
await p.evaluate(() => {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
});
await p.clock.fastForward(14000);
assert.equal(await active(), beforeHidden);
await p.evaluate(() => {
  delete document.hidden;
  document.dispatchEvent(new Event("visibilitychange"));
});
await p.clock.fastForward(6510);
await p.waitForTimeout(30);
assert.notEqual(await active(), beforeHidden);
const pause = p.getByRole("button", {
  name: "Pause banner autoplay",
  exact: true,
});
await pause.focus();
await pause.press("Enter");
await p.evaluate(() => document.activeElement.blur());
const paused = await active();
await p.clock.fastForward(20000);
assert.equal(await active(), paused);
await p
  .getByRole("button", { name: "Start banner autoplay", exact: true })
  .focus();
await p.keyboard.press("Enter");
await p.evaluate(() => document.activeElement.blur());
await p.clock.fastForward(6510);
await p.waitForTimeout(30);
assert.notEqual(await active(), paused);
await p.emulateMedia({ reducedMotion: "reduce" });
const reduced = await p
  .locator(".carousel-photo.is-active img")
  .evaluate((e) => ({
    transform: getComputedStyle(e).transform,
    animation: getComputedStyle(e).animationName,
  }));
assert.equal(reduced.animation, "none");
assert.equal(reduced.transform, "none");
assert.deepEqual(errors, []);
await p.clock.resume();
await p.locator(".carousel-content .actions a").first().click();
await p.waitForURL("**/book");
await p.locator("h1").waitFor();
await p.goBack();
await p.locator(".carousel-content .actions a").nth(1).click();
await p.waitForURL("**/services");
await p.locator("h1").waitFor();
await b.close();
const result = {
  firstLoads,
  zoomOut,
  autoplay6500ms: true,
  hoverPause: true,
  focusPause: true,
  hiddenHandlerPause: true,
  keyboardPauseResume: true,
  reducedMotion: reduced,
  ctaNavigation: ["/book", "/services"],
  errors,
};
fs.writeFileSync(
  "qa/hero-motion-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
