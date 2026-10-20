import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true});
const page = await browser.newPage({viewport: {width: 1624, height: 950}, reducedMotion: 'reduce'});
const errors = [];
const videos = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (/\.mp4|\.webm/.test(r.url())) videos.push(r.url()); });
await page.goto('http://127.0.0.1:4317');
await expect(page.locator('.reference-hero video')).toHaveCount(0);
await expect(page.locator('.hero-video-toggle')).toHaveCount(0);
await expect(page.locator('.intro-botanical, .intro-story-card, .intro-care-card')).toHaveCount(0);
const intro = page.locator('.reference-intro');
const photo = intro.locator('img');
await expect(photo).toHaveAttribute('alt', /standing together/);
await intro.scrollIntoViewIfNeeded();
await expect.poll(() => photo.evaluate(i => i.complete && i.naturalWidth > 0)).toBe(true);
await intro.screenshot({path: 'qa/intro-clean-desktop.png'});
for (const width of [375,390,430,768,1024,1440,1920]) {
  await page.setViewportSize({width, height:950});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width}`).toBe(true);
}
await page.setViewportSize({width:390,height:844});
await intro.screenshot({path: 'qa/intro-clean-mobile.png'});
expect(videos).toEqual([]);
expect(errors).toEqual([]);
console.log('PASS static hero, no video requests, no botanical decoration, standing team image loaded, 7 viewport widths.');
await browser.close();
