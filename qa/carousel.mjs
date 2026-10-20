import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:4317');await page.getByRole('button',{name:'Pause banner autoplay'}).waitFor();
await expect(page.locator('.carousel-counter')).toHaveText('01 / 03');
await expect(page.locator('.carousel-counter')).toHaveText('02 / 03',{timeout:8500});
await expect(page.locator('.carousel-counter')).toHaveText('03 / 03',{timeout:8500});
await expect(page.locator('.carousel-counter')).toHaveText('01 / 03',{timeout:8500});
await page.getByRole('button',{name:'Pause banner autoplay'}).click();
await page.mouse.move(0,0);await page.getByRole('button',{name:'Start banner autoplay'}).blur();
await page.waitForTimeout(6400);await expect(page.locator('.carousel-counter')).toHaveText('01 / 03');
await page.getByRole('button',{name:'Next banner'}).click();await expect(page.locator('.carousel-counter')).toHaveText('02 / 03');
await page.getByRole('button',{name:'Previous banner'}).click();await expect(page.locator('.carousel-counter')).toHaveText('01 / 03');
await page.getByRole('button',{name:'Show banner 3',exact:true}).click();await expect(page.locator('.carousel-counter')).toHaveText('03 / 03');
await page.getByRole('button',{name:'Show banner 1',exact:true}).click();
const report={autoplay:'1 → 2 → 3 → 1',pause:true,arrows:true,dots:true,widths:[],errors};
for(const width of [320,360,390,430,600,768,900,1024,1150,1200,1440,1920,2560]){
 await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
 const data=await page.evaluate(()=>{
  const r=s=>{const a=document.querySelector(s).getBoundingClientRect();return {x:a.x,y:a.y,width:a.width,height:a.height,right:a.right,bottom:a.bottom}};
  const content=r('.carousel-content'),media=r('.carousel-media'),header=r('.site-header'),controls=r('.carousel-controls'),quote=r('.reference-lead'),caption=r('.carousel-caption');
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,content,media,header,controls,quote,caption,fit:getComputedStyle(document.querySelector('.carousel-photo img')).objectFit};
 });report.widths.push(data);expect(data.scrollWidth).toBeLessThanOrEqual(width+1);expect(data.content.y).toBeGreaterThanOrEqual(data.header.bottom-1);expect(data.quote.y).toBeGreaterThan(data.controls.bottom);expect(data.quote.y).toBeGreaterThan(data.caption.bottom-1);
 if(width<=900){expect(data.media.y).toBeGreaterThanOrEqual(data.content.bottom);expect(data.fit).toBe('contain');}
 if([390,768,1440,1920].includes(width))await page.screenshot({path:`qa/carousel-${width}.png`});
}
await page.setViewportSize({width:1440,height:1000});await page.goto('http://localhost:4317/about');await expect(page.getByText('Cleaner homes',{exact:true})).toHaveCount(0);await expect(page.locator('.about-float')).toHaveCount(2);
await fs.writeFile('qa/carousel-report.json',JSON.stringify(report,null,2));expect(errors).toEqual([]);await browser.close();console.log(JSON.stringify({autoplay:report.autoplay,pause:true,arrows:true,dots:true,widths:report.widths.length,aboutCardRemoved:true,errors},null,2));
