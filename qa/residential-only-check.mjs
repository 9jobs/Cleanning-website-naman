import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { services, articles } from '../src/lib/data.ts';
import { heroSlides } from '../src/components/hero-slides.ts';
import { adminShell } from '../src/lib/invoices/shell.ts';
import { invoiceEmailHtml } from '../src/lib/invoices/email.ts';
import { invoiceSchema } from '../src/lib/invoices/model.ts';
const base='http://127.0.0.1:4328';
const out='qa/residential-only';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const report={pages:[],viewports:[],links:[],errors:[],admin:{},carousel:{},requests:[]};
if(process.argv.includes('--resume')) Object.assign(report,JSON.parse(await fs.readFile(out+'/report.json','utf8')));
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
await page.route('**/api/**',async route=>{
 if(route.request().method()!=='GET'){
  report.requests.push(route.request().url());
  return route.abort();
 }
 return route.continue();
});
const banned=/\b(commercial|office|construction|workplaces?|post-build)\b/i;
const links=new Set();
async function inspect(path,images=true){
 const response=await page.goto(base+path,{waitUntil:'networkidle'});
 assert.equal(response.status(),200,path);
 await page.locator('main').waitFor();
 assert.doesNotMatch(await page.locator('body').innerText(),banned,path);
 assert.doesNotMatch(await page.title(),banned,path+' title');
 if(images){
  await page.evaluate(async()=>{
   for(let y=0;y<document.body.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,35));}
   window.scrollTo(0,0);
  });
  await page.waitForTimeout(250);
  const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.alt||(!i.complete||!i.naturalWidth)).map(i=>({src:i.getAttribute('src'),alt:i.alt})));
  assert.deepEqual(broken,[],path+' images');
 }
 (await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')))).filter(h=>h.startsWith('/')&&!h.startsWith('//')&&!h.startsWith('/admin')&&!h.startsWith('/api')).forEach(h=>links.add(h.split('#')[0]));
 const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
 assert(overflow.scroll<=overflow.width+1,path+' horizontal overflow '+JSON.stringify(overflow));
 return {path,title:await page.title(),status:response.status()};
}
try {
 if(!process.argv.includes('--resume')) for(const path of ['/', '/about','/services',...services.map(s=>'/services/'+s.slug),'/pricing','/contact','/faq','/blog',...articles.map(a=>'/blog/'+a.slug)]){
  report.pages.push(await inspect(path));await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log('Checked '+path);
 }
 // Existing menu, slider and demo carousel mechanics.
 await inspect('/',false);
 await page.locator('.mega summary').click();
 assert.equal(await page.locator('.mega-links a').count(),9);
 await page.locator('.mega summary').click();
 const range=page.getByRole('slider',{name:'Compare before and after cleaning images'});
 await range.fill('72');assert.equal(await range.inputValue(),'72');
 await page.getByRole('button',{name:'Show experience 3'}).click();
 await page.waitForTimeout(400);
 assert.match(await page.locator('.experience-slide').innerText(),/Apartment Cleaning/);
 assert.match(await page.locator('.experience-top').innerText(),/NOT CUSTOMER TESTIMONIALS/);
 // Check every hero image and the unchanged autoplay control.
 assert.equal(await page.locator('.carousel-photo').count(),heroSlides.length);
 await page.evaluate(()=>window.scrollTo(0,0));
 if(await page.getByRole('button',{name:'Pause banner autoplay'}).count()) await page.getByRole('button',{name:'Pause banner autoplay'}).press('Enter');
 await page.getByRole('button',{name:'Start banner autoplay'}).press('Enter');
 await page.mouse.move(1,1);
 await page.evaluate(()=>document.activeElement?.blur());
 const initial=await page.locator('#home-title').innerText();
 await page.waitForTimeout(7000);
 const advanced=await page.locator('#home-title').innerText();
 assert.notEqual(initial,advanced);report.carousel={initial,advanced};
 await page.getByRole('button',{name:'Pause banner autoplay'}).press('Enter');
 for(const width of [1440,810,390]){
  await page.setViewportSize({width,height:1000});
  for(const path of ['/','/about','/services','/pricing','/contact','/services/end-of-lease-cleaning','/services/balcony-patio-cleaning']){
   report.viewports.push({...await inspect(path,false),width});
   if(path==='/'||path==='/services/end-of-lease-cleaning'||(path==='/contact'&&width===390)){
    await page.screenshot({path:out+'/'+(path==='/'?'home':path.replaceAll('/','-'))+'-'+width+'.png',fullPage:true});
   }
  }
  if(width===390){
   await page.goto(base+'/');
   await page.getByRole('button',{name:'Open navigation'}).click();
   assert(await page.locator('#mobile-nav').isVisible());
   await page.getByRole('button',{name:'Close navigation'}).click();
  }
 }
 await page.goto(base+'/contact?service=apartment-cleaning',{waitUntil:'networkidle'});
 assert.equal(await page.locator('#contact-service').inputValue(),'apartment-cleaning');
 const options=await page.locator('#contact-service option').allTextContents();
 for(const s of services)assert(options.includes(s.name),s.name+' quote option');
 assert.equal(report.requests.length,0,'Public QA never submitted data or requested checkout');
 for(const path of links){
  const response=await context.request.get(base+path);
  assert(response.status()<400,path+' broken link '+response.status());
  report.links.push({path,status:response.status()});
 }
 // Isolated fixture uses actual admin assets, with preview mocked in memory.
 const admin=await context.newPage();
 admin.on('pageerror',e=>report.errors.push(e.message));
 await admin.route(base+'/qa-admin-fixture',r=>r.fulfill({contentType:'text/html',body:adminShell('create')}));
 await admin.route('**/api/admin/invoices',async r=>{
  const body=r.request().postDataJSON();
  assert.equal(body.action,'preview','Admin QA is preview-only');
  const input=invoiceSchema.parse(body.data);
  await r.fulfill({contentType:'application/json',body:JSON.stringify({html:invoiceEmailHtml(input)})});
 });
 await admin.goto(base+'/qa-admin-fixture',{waitUntil:'networkidle'});
 const adminOptions=await admin.locator('select[name=service] option').allTextContents();
 assert.deepEqual(adminOptions,services.map(s=>s.name));
 await admin.getByLabel('Number of people').fill('3');
 await admin.waitForTimeout(550);
 assert.match(await admin.frameLocator('#email-preview').locator('body').innerText(),/Number of people\s+3/);
 assert.equal(await admin.locator('[name=amount]').inputValue(),'70.00');
 const cols=await admin.locator('.billing-fields').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 assert.equal(cols,1);
 assert.equal(await admin.getByRole('heading',{name:'Choose an invoice type'}).count(),0);
 await admin.screenshot({path:out+'/admin-options.png',fullPage:true});
 report.admin={services:adminOptions,numberOfPeople:3,amount:'70.00',billingColumns:cols,mode:'isolated preview fixture; no saved data or payment calls'};
 assert.deepEqual(report.errors,[],'Browser errors');
 await fs.writeFile(out+'/report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({pages:report.pages.length,viewports:report.viewports.length,links:report.links.length,errors:report.errors,admin:report.admin,carousel:report.carousel},null,2));
} finally {await browser.close();}
