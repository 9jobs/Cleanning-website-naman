// Reuses the labelled production test receipt after a new deployment; no new mail.
import assert from "node:assert/strict";
import fs from "node:fs";
import pg from "pg";
import { chromium } from "@playwright/test";
const base = "https://thrive4-cleaning.vercel.app";
const report = JSON.parse(
  fs.readFileSync("qa/contact-database-report.json", "utf8"),
);
assert.equal(report.baseUrl, base);
const db = new pg.Client({
  connectionString: process.env.CONTACT_DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
  },
  connectionTimeoutMillis: 12000,
});
await db.connect();
try {
  const row = (
    await db.query("select * from public.contact_enquiries where id=$1", [
      report.reference,
    ])
  ).rows[0];
  assert.equal(row.notification_status, "sent");
  const payload = {
    submissionId: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    property: row.property_type,
    location: row.location,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    frequency: row.frequency,
    size: row.floor_area == null ? undefined : Number(row.floor_area),
    date: "",
    message: row.message,
    consent: row.consent,
    website: "",
  };
  const response = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).reference, row.id);
  const after = (
    await db.query(
      "select notification_attempts from public.contact_enquiries where id=$1",
      [row.id],
    )
  ).rows[0];
  assert.equal(after.notification_attempts, 1);
} finally {
  await db.end();
}
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const secrets = [
  process.env.CONTACT_DATABASE_URL,
  process.env.CONTACT_SMTP_PASSWORD,
  process.env.CONTACT_SMTP_PASSWORD?.replace(/\s/g, ""),
  process.env.CONTACT_RATE_LIMIT_SECRET,
].filter(Boolean);
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of ["/", "/about", "/pricing", "/services", "/contact"]) {
    const response = await page.goto(base + route);
    assert.equal(response.status(), 200);
    await page.locator("h1").waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
    const html = await page.content();
    assert.equal(
      secrets.some((value) => html.includes(value)),
      false,
    );
  }
  const scripts = await page
    .locator("script[src]")
    .evaluateAll((nodes) => nodes.map((node) => node.src));
  for (const url of scripts) {
    const text = await (await fetch(url)).text();
    assert.equal(
      secrets.some((value) => text.includes(value)),
      false,
    );
  }
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.ok(sitemap.includes(`${base}/contact`));
  assert.ok(!sitemap.includes("localhost"));
  assert.ok(!sitemap.includes("vijay-shukla-dev"));
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      productionReplayAcrossDeployments: true,
      extraEmailsSent: 0,
      publicCanonicalUrl: base,
      mobileRoutesChecked: 5,
      horizontalOverflow: false,
      browserErrors: errors,
      clientSecretFindings: 0,
    }),
  );
} finally {
  await browser.close();
}
