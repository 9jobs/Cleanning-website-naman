import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const path of ['/pricing','/']) {
 await page.goto(`http://localhost:4317${path}`);await page.evaluate(()=>document.fonts.ready);await page.locator('h1').waitFor({state:'visible'});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
 await expect(page.locator('.desktop-nav').getByRole('link',{name:'Service Areas',exact:true})).toHaveCount(0);
 await expect(page.locator('.desktop-nav').getByRole('link',{name:'Reviews',exact:true})).toHaveCount(0);
 expect(await page.locator('.site-header').evaluate(x=>getComputedStyle(x).backgroundColor)).toBe('rgb(255, 255, 255)');
 if(path==='/pricing') {
  await expect(page.locator('.pricing-plan-price strong')).toHaveText(['AUD $120','AUD $220','AUD $300']);
  await expect(page.getByText('Clear answers on cleaning costs.')).toHaveCount(0);
  await page.screenshot({path:'qa/pricing-final-1440.png'});
 } else {
  expect(await page.locator('.carousel-content h1').evaluate(x=>x.getBoundingClientRect().top)).toBeGreaterThan(82);
  await page.screenshot({path:'qa/home-white-nav-1440.png'});
 }
 await page.setViewportSize({width:390,height:1000});
 await page.getByRole('button',{name:'Open navigation'}).click();
 const mobile=page.locator('.mobile-nav');
 await expect(mobile.getByRole('link',{name:'Service Areas',exact:true})).toHaveCount(0);
 await expect(mobile.getByRole('link',{name:'Reviews',exact:true})).toHaveCount(0);
 await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.setViewportSize({width:1440,height:1100});
}
expect(errors).toEqual([]);await browser.close();console.log('PASS: prices, pricing-only layout, matching white nav on home, removed desktop/mobile links, no browser errors.');
