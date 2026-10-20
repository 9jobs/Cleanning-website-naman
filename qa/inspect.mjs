import { chromium } from "@playwright/test";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
p.on("console", (m) => console.log("console", m.type(), m.text()));
p.on("requestfailed", (r) => console.log("failed", r.url(), r.failure()));
p.on("response", (r) => {
  if (r.status() >= 400) console.log("http", r.status(), r.url());
});
await p.goto("http://127.0.0.1:4317");
await p.waitForLoadState("networkidle");
await p
  .getByRole("button", { name: "Open navigation" })
  .click({ timeout: 15000 });
console.log(await p.locator(".hero-copy").innerHTML());
console.log(
  await p.evaluate(() => ({
    animations: document.getAnimations().length,
    overflow: [...document.querySelectorAll("*")]
      .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
      .map((e) => ({
        tag: e.tagName,
        cls: e.className,
        right: e.getBoundingClientRect().right,
      }))
      .slice(0, 15),
  })),
);
await p.screenshot({ path: "qa/viewport.png" });
await b.close();
