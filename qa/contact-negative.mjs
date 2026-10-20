import {chromium,expect} from '@playwright/test';import fs from 'node:fs/promises';import nextEnv from '@next/env'; const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd(),true,{info(){},error(){}});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await b.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});
await p.goto('http://localhost:4317/contact?service=deep-cleaning&postcode=3000');await p.locator('h1').waitFor({state:'visible'});
await p.route('**/api/contact',async route=>{await new Promise(resolve=>setTimeout(resolve,450));await route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'We couldn’t send your enquiry. Please try again.'})});});
await p.getByLabel('Full Name',{exact:false}).fill('Form Error Test');await p.getByLabel('Email Address',{exact:false}).fill('test@example.com');await p.getByLabel('Phone Number',{exact:false}).fill('0400000000');await p.getByLabel('Property Type',{exact:false}).selectOption('House');await p.getByRole('checkbox').check();
await p.getByRole('button',{name:'Get My Free Quote',exact:true}).click();await expect(p.getByRole('button',{name:'Sending your enquiry…'})).toBeDisabled();
await expect(p.locator('.contact-quote-alert[role="alert"]')).toContainText('couldn’t send');await expect(p.getByLabel('Full Name',{exact:false})).toHaveValue('Form Error Test');await expect(p.getByText('ENQUIRY SENT',{exact:true})).toHaveCount(0);
await p.unroute('**/api/contact');
const html=await (await p.request.get('http://localhost:4317/contact')).text();expect(html.includes(process.env.CONTACT_SMTP_PASSWORD)).toBe(false);
const scripts=await p.locator('script[src]').evaluateAll(xs=>xs.map(x=>x.src));for(const src of scripts){const js=await (await p.request.get(src)).text();expect(js.includes(process.env.CONTACT_SMTP_PASSWORD)).toBe(false);}
const environmentResponse=await p.request.get('http://localhost:4317/.env.local');const environmentPage=await environmentResponse.text();expect(environmentPage.includes(process.env.CONTACT_SMTP_PASSWORD)).toBe(false);expect(environmentPage).toContain('Looking for a clean start?');
await p.locator('.contact-quote-consent').screenshot({path:'qa/contact-consent.png'});
await fs.writeFile('qa/contact-negative-report.json',JSON.stringify({failedSendKeepsValues:true,noFakeSuccess:true,loadingState:true,passwordNotInHtmlOrClientScripts:true,environmentNotPublic:true,scriptsChecked:scripts.length},null,2));await b.close();console.log('PASS: failure/loading state, retained values, no fake success, no SMTP password in browser HTML/scripts, environment file unavailable publicly. No email sent.');
