import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const phase=process.argv[2]||'before';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({reducedMotion:'reduce'});
const records=[];
for(const width of [1440,1920])for(const route of ['/','/about','/pricing','/contact','/services','/services/house-cleaning','/services/garden-cleaning','/services/construction-cleaning']){
 await p.setViewportSize({width,height:1000});await p.goto('http://localhost:4317'+route);await p.waitForTimeout(160);
 await p.addStyleTag({content:'html{scroll-behavior:auto!important} nextjs-portal,.back-top{visibility:hidden!important}'});
 const pause=p.getByRole('button',{name:'Pause banner autoplay',exact:true});if(await pause.count()){await pause.focus();await p.keyboard.press('Enter');await p.locator('.carousel-hero > button').evaluate(e=>e.blur());}
 await p.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.documentElement.scrollHeight;y+=750){scrollTo(0,y);await new Promise(r=>setTimeout(r,55));}scrollTo(0,0);});
 await p.waitForFunction(()=>[...document.images].filter(e=>e.getBoundingClientRect().width>0).every(e=>e.complete),{},{timeout:20000}).catch(()=>{});await p.waitForTimeout(350);
 const rects=await p.evaluate(()=>[...document.querySelectorAll('header,main section,main h1,main h2,main h3,main p,main .button,main input,main select,main textarea,footer,footer h2,footer p,footer a')].filter(e=>e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,text:e.textContent.trim().slice(0,60),x:Math.round(r.x*10)/10,y:Math.round((r.y+scrollY)*10)/10,w:Math.round(r.width*10)/10,h:Math.round(r.height*10)/10,font:s.fontSize};}));
 const name=(route==='/'?'home':route.slice(1).replaceAll('/','--'))+'-'+width;
 await p.screenshot({path:`qa/responsive-${phase}/${name}-stable.png`,fullPage:true,animations:'disabled'});
 records.push({route,width,rects});console.log(phase,name);
}
await fs.writeFile(`qa/responsive-desktop-${phase}.json`,JSON.stringify(records,null,2));await b.close();
if(phase==='after'){
 const before=JSON.parse(await fs.readFile('qa/responsive-desktop-before.json','utf8'));
 const differences=[];for(let i=0;i<records.length;i++)if(JSON.stringify(records[i])!==JSON.stringify(before[i]))differences.push({route:records[i].route,width:records[i].width,changes:records[i].rects.filter((r,j)=>JSON.stringify(r)!==JSON.stringify(before[i].rects[j])).slice(0,5)});
 console.log(JSON.stringify({desktopComparisons:records.length,differences}));
 await fs.writeFile('qa/responsive-desktop-comparison.json',JSON.stringify({desktopComparisons:records.length,differences},null,2));
}
