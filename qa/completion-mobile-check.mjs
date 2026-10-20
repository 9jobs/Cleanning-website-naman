import {chromium} from '@playwright/test';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await b.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
await p.goto('http://localhost:4317/contact');await p.locator('h1').waitFor({state:'visible'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
console.log(await p.evaluate(()=>({body:document.body.getBoundingClientRect().height,scroll:document.documentElement.scrollHeight,footer:document.querySelector('footer').getBoundingClientRect().bottom,tail:[...document.body.children].map(x=>({tag:x.tagName,cls:x.className,b:x.getBoundingClientRect().bottom,position:getComputedStyle(x).position}))})));
await p.screenshot({path:'qa/completion/contact-mobile-settled.png',fullPage:true});await p.locator('.finish-form-wrap').screenshot({path:'qa/completion/contact-mobile-form.png'});await b.close();
