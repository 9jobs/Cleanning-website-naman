// One labelled verification enquiry. A stable test ID makes reruns idempotent.
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import pg from "pg";
import { chromium, expect } from "@playwright/test";
const base = "http://localhost:4317";
assert.equal(
  process.env.CONTACT_TO_EMAIL?.trim().toLowerCase(),
  "thrive4cleaning@gmail.com",
  "Unexpected notification destination; no email sent.",
);
const idFile = "qa/quick-quote-live-id.json";
const submissionId = fs.existsSync(idFile)
  ? JSON.parse(fs.readFileSync(idFile, "utf8")).submissionId
  : randomUUID();
fs.writeFileSync(idFile, JSON.stringify({ submissionId }));
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const p = await b.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
let submitted;
let requests = 0;
await p.route("**/api/quick-quote", async (route) => {
  submitted = { ...route.request().postDataJSON(), submissionId };
  requests++;
  await route.continue({ postData: JSON.stringify(submitted) });
});
try {
  await p.goto(base);
  const form = p.getByRole("form", { name: "Quick cleaning quote" });
  await form
    .getByLabel("First name", { exact: true })
    .fill("Website Quick Quote Test - Please Ignore");
  await form
    .getByLabel("Email address", { exact: true })
    .fill("Thrive4cleaning@gmail.com");
  await form.getByLabel("Phone number", { exact: true }).fill("0400000000");
  const received = p.waitForResponse(
    (r) => r.url() === base + "/api/quick-quote",
    { timeout: 60000 },
  );
  await form.getByRole("button", { name: "Get My Free Quote" }).click();
  const response = await received;
  const result = await response.json();
  if (response.status() !== 200)
    throw new Error(`Live form returned ${response.status()}: ${result.error}`);
  assert.equal(result.reference, submissionId);
  await expect(p.locator('.hero-enquiry [role="status"]')).toContainText(
    "Your quote request has been received",
  );
  assert.equal(requests, 1);
  await p
    .locator(".hero-enquiry")
    .screenshot({ path: "qa/quick-quote-live-success.png" });
  for (let i = 0; i < 2; i++) {
    const replay = await p.request.post(base + "/api/quick-quote", {
      headers: { origin: base },
      data: submitted,
    });
    assert.equal(replay.status(), 200);
    assert.equal((await replay.json()).reference, submissionId);
  }
  const conflict = await p.request.post(base + "/api/quick-quote", {
    headers: { origin: base },
    data: { ...submitted, name: "Changed Verification" },
  });
  assert.equal(conflict.status(), 409);
  const cases = [
    {
      headers: { origin: "https://example.invalid" },
      data: submitted,
      status: 403,
    },
    { headers: { origin: base }, data: {}, status: 400 },
    {
      headers: { origin: base },
      data: { ...submitted, website: "spam" },
      status: 400,
    },
    {
      headers: { origin: base, "content-type": "text/plain" },
      data: "invalid",
      status: 415,
    },
    {
      headers: { origin: base },
      data: { text: "x".repeat(5000) },
      status: 413,
    },
  ];
  for (const check of cases) {
    const r = await p.request.post(base + "/api/quick-quote", {
      headers: check.headers,
      data: check.data,
    });
    assert.equal(r.status(), check.status);
  }
  const html = await p.content();
  const scripts = await p
    .locator("script[src]")
    .evaluateAll((es) => es.map((e) => e.src));
  const sensitive = [
    process.env.CONTACT_SMTP_PASSWORD,
    process.env.CONTACT_DATABASE_URL,
    process.env.CONTACT_RATE_LIMIT_SECRET,
  ].filter(Boolean);
  for (const secret of sensitive)
    assert(!html.includes(secret), "Credential exposed in HTML");
  for (const url of scripts) {
    const text = await (await p.request.get(url)).text();
    for (const secret of sensitive)
      assert(!text.includes(secret), "Credential exposed in client JavaScript");
  }
  const db = new pg.Client({
    connectionString: process.env.CONTACT_DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
    },
    connectionTimeoutMillis: 12000,
  });
  try {
    await db.connect();
    const { rows } = await db.query(
      "select id,name,email,phone,source,consent,notification_status,notification_attempts,email_message_id,email_sent_at,created_at from public.quick_quote_enquiries where id=$1",
      [submissionId],
    );
    assert.equal(rows.length, 1);
    const row = rows[0];
    assert.equal(row.name, submitted.name);
    assert.equal(row.email, submitted.email);
    assert.equal(row.phone, submitted.phone);
    assert.equal(row.source, "homepage-quick-quote");
    assert.equal(row.consent, true);
    assert.equal(row.notification_status, "sent");
    assert.equal(row.notification_attempts, 1);
    assert(row.email_message_id);
    assert(row.email_sent_at >= row.created_at);
    const output = {
      databaseSaved: true,
      gmailSmtpAccepted: true,
      reference: submissionId,
      notificationAttempts: row.notification_attempts,
      replayDidNotResend: true,
      conflictingReplayBlocked: true,
      invalidAndCrossOriginRequestsBlocked: true,
      credentialsServerOnly: true,
      testLabel: "Website Quick Quote Test - Please Ignore",
      localOnly: true,
    };
    fs.writeFileSync(
      "qa/quick-quote-live-report.json",
      JSON.stringify(output, null, 2),
    );
    console.log(JSON.stringify(output));
  } finally {
    await db.end();
  }
} finally {
  await b.close();
}
