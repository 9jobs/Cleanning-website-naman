import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {chromium,expect} from '@playwright/test';
const mode=process.argv[2]||'before';
const protectedFiles=['src/components/home-carousel.tsx','src/components/hero-enquiry.tsx','src/components/inner-pages.tsx','src/components/pricing-plans.tsx','src/components/showcase.tsx','src/components/interactive.tsx','src/components/forms.tsx','src/components/ui.tsx','src/components/motion.tsx','src/components/layout.tsx','src/lib/config.ts','src/lib/data.ts',...(await fs.readdir('src/app')).filter(x=>x.endsWith('.css')&&x!=='completion.css').map(x=>'src/app/'+x)];
const hashes={};for(const file of protectedFiles)hashes[file]=crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
const home=await fs.readFile('src/app/page.tsx','utf8');const prefix=home.slice(home.indexOf('      <HomeHero />'),home.indexOf('      <section className="section service-showcase">'));
hashes['homepage-protected-prefix']=crypto.createHash('sha256').update(prefix).digest('hex');
const service=await fs.readFile('src/app/services/[slug]/page.tsx','utf8');hashes['service-hero-source']=crypto.createHash('sha256').update(service.slice(service.indexOf('      <section className="service-hero">'),service.indexOf('      </section>')+16)).digest('hex');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
const report={mode,hashes,screens:[]};const screenshotStyle='nextjs-portal,.scroll-progress,.back-top {visibility:hidden!important}';
for(const width of [390,1440]){
 await page.setViewportSize({width,height:1000});
 for(const route of ['/','/about','/pricing']){
  await page.goto('http://localhost:4317'+route);await page.locator('h1').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(300);
  const slug=route==='/'?'home':route.slice(1);
  const selectors=route==='/'?['.carousel-hero','.reference-lead','.reference-intro','.reference-packages','.site-header','footer']:['main','.site-header','footer'];
  for(const selector of selectors){
   const item=page.locator(selector).first();await item.scrollIntoViewIfNeeded();await page.waitForTimeout(120);
   const name=`${slug}-${width}-${selector.replace(/[^a-z]/gi,'')}.png`;
   await item.screenshot({path:`qa/completion/${mode}-${name}`,style:screenshotStyle,animations:'disabled'});
   const metrics=await item.evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,text:el.textContent,heading:[...el.querySelectorAll('h1,h2')].map(x=>({text:x.textContent,size:getComputedStyle(x).fontSize,font:getComputedStyle(x).fontFamily})),background:getComputedStyle(el).backgroundColor}});
   const png=await fs.readFile(`qa/completion/${mode}-${name}`);report.screens.push({name,metrics,sha:crypto.createHash('sha256').update(png).digest('hex')});
  }
 }
}
await browser.close();await fs.writeFile(`qa/completion/${mode}.json`,JSON.stringify(report,null,2));
if(mode==='after'){
 const before=JSON.parse(await fs.readFile('qa/completion/before.json','utf8'));
 const files=Object.keys(before.hashes).filter(x=>before.hashes[x]!==hashes[x]);
 const metrics=report.screens.filter(x=>JSON.stringify(x.metrics)!==JSON.stringify(before.screens.find(y=>y.name===x.name)?.metrics)).map(x=>x.name);
 const pixels=report.screens.filter(x=>x.sha!==before.screens.find(y=>y.name===x.name)?.sha).map(x=>x.name);
 await fs.writeFile('qa/completion/regression.json',JSON.stringify({files,metrics,pixels},null,2));
 expect(files).toEqual([]);expect(metrics).toEqual([]);console.log(JSON.stringify({protectedFiles:Object.keys(hashes).length,geometryAndCopy:report.screens.length,pixelDifferences:pixels},null,2));
}else console.log(`BASELINE: ${Object.keys(hashes).length} protected hashes; ${report.screens.length} screenshots/geometry samples.`);
