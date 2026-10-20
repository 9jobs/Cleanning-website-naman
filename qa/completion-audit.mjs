import {chromium,expect} from '@playwright/test';import fs from 'node:fs/promises';
const data=await fs.readFile('src/lib/data.ts','utf8');
const serviceSlugs=[...data.split('export const faqs')[0].matchAll(/slug: "([^"]+)"/g)].map(x=>x[1]);
const articleSlugs=[...data.split('export const articles')[1].matchAll(/slug: "([^"]+)"/g)].map(x=>x[1]);
const routes=['/','/about','/pricing','/services','/contact','/quote','/areas','/reviews','/faq','/book','/blog','/careers','/privacy','/terms','/book/confirmation','/quote/confirmation',...serviceSlugs.map(x=>'/services/'+x),...articleSlugs.map(x=>'/blog/'+x)];
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={routes:[],responsive:[],links:[],errors};const links=new Set();
for(const route of routes){
 const response=await page.goto('http://localhost:4317'+route);await page.locator('h1').waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);
 const headings=await page.locator('h1').count();report.routes.push({route,status:response.status(),headings});
 for(const link of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href'))))if(link?.startsWith('/')&&!link.startsWith('/api/')&&!link.startsWith('//'))links.add(link.split(/[?#]/)[0]);
 for(const width of [375,390,430,768,1024,1280,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
  const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('main .completion *')].filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)&&getComputedStyle(x).position!=='absolute';}).slice(0,5).map(x=>({tag:x.tagName,class:x.className,text:x.textContent.slice(0,60)}))}));report.responsive.push({route,...state});
 }
 if(['/','/services','/contact','/book','/areas','/faq','/reviews','/careers','/blog','/services/deep-cleaning','/blog/kitchen-reset-guide'].includes(route)){
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{document.querySelectorAll('img').forEach(x=>x.loading='eager');scrollTo(0,0)});await page.waitForTimeout(150);await page.screenshot({path:`qa/completion/page-${route==='/'?'home':route.slice(1).replaceAll('/','-')}.png`,fullPage:true});
  if(['/','/contact','/book','/services','/faq'].includes(route)){await page.setViewportSize({width:390,height:1000});await page.screenshot({path:`qa/completion/mobile-${route==='/'?'home':route.slice(1)}.png`,fullPage:true});}
 }
}
for(const link of links){const response=await page.request.get('http://localhost:4317'+link);report.links.push({link,status:response.status()});}
await fs.writeFile('qa/completion/audit-report.json',JSON.stringify(report,null,2));await browser.close();
const failures={routes:report.routes.filter(x=>x.status!==200||x.headings!==1),overflow:report.responsive.filter(x=>x.scrollWidth>x.width+1||x.offenders.length),links:report.links.filter(x=>x.status!==200),errors};
console.log(JSON.stringify({routes:routes.length,viewportChecks:report.responsive.length,internalLinks:links.size,failures},null,2));if(Object.values(failures).some(x=>x.length))process.exitCode=1;
