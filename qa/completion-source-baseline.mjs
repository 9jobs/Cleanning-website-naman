import fs from 'node:fs/promises';import crypto from 'node:crypto';
const p='qa/completion/before.json';const report=JSON.parse(await fs.readFile(p,'utf8'));
const service=await fs.readFile('src/app/services/[slug]/page.tsx','utf8');report.hashes['service-hero-source']=crypto.createHash('sha256').update(service.slice(service.indexOf('      <section className="service-hero">'),service.indexOf('      </section>')+16)).digest('hex');
await fs.writeFile(p,JSON.stringify(report,null,2));
