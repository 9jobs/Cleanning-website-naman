import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const routes=['/','/about','/services','/pricing','/areas','/reviews','/faq','/contact','/book','/careers','/blog','/quote','/privacy','/terms','/services/regular-house-cleaning','/services/commercial-cleaning','/services/window-cleaning','/services/oven-cleaning','/blog/kitchen-reset-guide','/book/confirmation','/quote/confirmation'];
const report={pages:[],errors};
for(const route of routes){
  const response=await page.goto('http://localhost:4317'+route);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  for(const width of (process.argv.includes('--edges') ? [320,1024,1920] : [390,768,1440])){
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const check=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,oldBrand:/cleannora|clearora/i.test(document.body.innerText),overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+3||r.left<-3)&&getComputedStyle(e).position!=='absolute';}).slice(0,5).map(e=>e.className)}));
    report.pages.push({route,status:response.status(),...check});
    if(width===1440&&['/about','/services','/pricing','/contact','/book'].includes(route))await page.screenshot({path:`qa/thrive-${route.slice(1)}.png`,fullPage:true});
    if(width===390&&route==='/about')await page.screenshot({path:'qa/thrive-about-mobile.png',fullPage:true});
  }
}
await fs.writeFile(process.argv.includes('--edges') ? 'qa/thrive-edges-report.json' : 'qa/thrive-report.json',JSON.stringify(report,null,2));
await browser.close();
const failures=report.pages.filter(p=>p.status!==200||p.width>p.viewport+1||p.oldBrand);
console.log(JSON.stringify({checks:report.pages.length,failures,errors},null,2));if(failures.length||errors.length)process.exitCode=1;
