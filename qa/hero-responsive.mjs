import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={layouts:[],menus:[],errors};
for(const width of [320,360,375,390,430,600,768,820,900,1024,1150,1200,1280,1440,1920,2560]) {
 await page.setViewportSize({width,height:1000});await page.goto('http://localhost:4317');await page.locator('.thrive-hero-photo img').waitFor();await page.evaluate(()=>document.fonts.ready);
 await expect.poll(()=>page.locator('.thrive-hero-photo img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 const geometry=await page.evaluate(()=>{
  const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
  const header=rect('.header-inner'),logo=rect('.site-header .logo'),actions=rect('.header-actions'),hero=rect('.thrive-hero'),copy=rect('.thrive-hero-copy'),visual=rect('.thrive-hero-visual'),quote=rect('.reference-lead'),img=document.querySelector('.thrive-hero-photo img');
  return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,header,hero,copy,visual,quote,logoActionsOverlap:overlap(logo,actions),copyPhotoOverlap:overlap(copy,visual),imageFit:getComputedStyle(img).objectFit,imageFilter:getComputedStyle(img).filter,headerBlur:getComputedStyle(document.querySelector('.site-header')).backdropFilter};
 });report.layouts.push(geometry);
 expect(geometry.scrollWidth,`${width} horizontal overflow`).toBeLessThanOrEqual(width+1);expect(geometry.logoActionsOverlap).toBe(false);expect(geometry.copyPhotoOverlap).toBe(false);expect(geometry.quote.top).toBeGreaterThanOrEqual(geometry.hero.bottom);expect(geometry.hero.top).toBeGreaterThanOrEqual(geometry.header.bottom-1);expect(geometry.imageFit).toBe('contain');expect(geometry.imageFilter).toBe('none');expect(geometry.headerBlur).toBe('none');
 if([390,768,1440,1920].includes(width))await page.screenshot({path:`qa/hero-fixed-${width}.png`});
 if(width<=1150) {
  await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.locator('#mobile-nav')).toBeVisible();
  const bounds=await page.locator('#mobile-nav').boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width+1);
  await page.getByRole('button',{name:'Close navigation'}).press('Escape');await expect(page.locator('#mobile-nav')).toBeHidden();report.menus.push(width);
 }
}
// Short landscape screens must scroll their menu, not clip its final links.
await page.setViewportSize({width:667,height:375});await page.goto('http://localhost:4317');await page.getByRole('button',{name:'Open navigation'}).click();
await page.locator('#mobile-nav').getByRole('link',{name:'Book a Clean',exact:true}).scrollIntoViewIfNeeded();await expect(page.locator('#mobile-nav').getByRole('link',{name:'Book a Clean',exact:true})).toBeInViewport();
await fs.writeFile('qa/hero-responsive-report.json',JSON.stringify(report,null,2));expect(errors).toEqual([]);await browser.close();console.log(JSON.stringify({layouts:report.layouts.length,menus:report.menus.length,landscape:'passed',errors},null,2));
