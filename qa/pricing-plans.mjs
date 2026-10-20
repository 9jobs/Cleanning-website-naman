import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:4317/pricing');await page.evaluate(()=>document.fonts.ready);
await expect(page.locator('.pricing-plan-card')).toHaveCount(3);
await expect(page.locator('.inner-hero')).toHaveCount(0);
await page.screenshot({path:'qa/pricing-plans-1440.png'});
const cards=page.locator('.pricing-plan-card');
await cards.nth(1).getByRole('link',{name:'Get a Quote',exact:true}).click();
await expect(page).toHaveURL(/quote\?service=deep-cleaning/);
await expect(page.locator('select[name="service"]')).toHaveValue('deep-cleaning');
await page.goto('http://localhost:4317/pricing?bedrooms=3&postcode=3000');
await page.getByRole('button',{name:'Deep Cleaning',exact:true}).click();
await expect(page.locator('.pricing-plan-card')).toHaveCount(2);
await expect(page.getByRole('button',{name:'Deep Cleaning',exact:true})).toHaveAttribute('aria-pressed','true');
await page.locator('.pricing-plan-card').first().getByRole('link',{name:'Book This Plan',exact:true}).click();
await expect(page).toHaveURL(/book\?/);
await expect(page.locator('input[value="deep-cleaning"]')).toBeChecked();
expect(new URL(page.url()).searchParams.get('bedrooms')).toBe('3');
const report=[];
await page.goto('http://localhost:4317/pricing');
for(const width of [320,390,600,768,900,1024,1440,1920]) {
 await page.setViewportSize({width,height:1100});
 const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('.pricing-plan-card')].map(x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height}})}));
 expect(size.scroll).toBeLessThanOrEqual(width+1);
 for(const card of size.cards){expect(card.left).toBeGreaterThanOrEqual(0);expect(card.right).toBeLessThanOrEqual(width);}
 if(width>800)expect(Math.max(...size.cards.map(x=>x.height))-Math.min(...size.cards.map(x=>x.height))).toBeLessThan(2);
 report.push(size);
 if([390,900,1920].includes(width))await page.screenshot({path:`qa/pricing-plans-${width}.png`});
}
expect(errors).toEqual([]);await fs.writeFile('qa/pricing-plans-report.json',JSON.stringify({report,errors,quoteService:true,bookingService:true,filter:true},null,2));
await browser.close();console.log('PASS: pricing cards, filters, quote/booking handoff, query preservation, 8 responsive widths, no browser errors.');
