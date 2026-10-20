// Sends ONE labelled test email, then checks the same enquiry in PostgreSQL.
// Run: node --env-file=.env.local qa/contact-database.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import pg from "pg";
await import("./contact-email.mjs");
const report = JSON.parse(
  fs.readFileSync("qa/contact-email-report.json", "utf8"),
);
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
  const result = await db.query(
    `select id, name, service, property_type, bedrooms,
    bathrooms, consent, notification_status, notification_attempts,
    email_message_id, email_sent_at, created_at
    from public.contact_enquiries where id = $1`,
    [report.reference],
  );
  assert.equal(result.rowCount, 1);
  const row = result.rows[0];
  assert.equal(row.name, "Website Delivery Test");
  assert.equal(row.service, "regular-house-cleaning");
  assert.equal(row.property_type, "House");
  assert.equal(row.bedrooms, 3);
  assert.equal(row.bathrooms, 1);
  assert.equal(row.consent, true);
  assert.equal(row.notification_status, "sent");
  assert.equal(row.notification_attempts, 1);
  assert.ok(row.email_message_id);
  assert.ok(row.email_sent_at >= row.created_at);
  const access = await db.query(`select
    has_table_privilege('anon','public.contact_enquiries','SELECT') as anon_read,
    has_table_privilege('anon','public.contact_enquiries','INSERT') as anon_write,
    has_table_privilege('authenticated','public.contact_enquiries','SELECT') as user_read`);
  assert.deepEqual(access.rows[0], {
    anon_read: false,
    anon_write: false,
    user_read: false,
  });
  const output = {
    databaseSaved: true,
    emailAccepted: true,
    sameReference: true,
    deliveryAttempts: row.notification_attempts,
    duplicatePrevented: true,
    publicAccessBlocked: true,
    reference: row.id,
    baseUrl: process.env.QA_BASE_URL || "http://localhost:4317",
  };
  fs.writeFileSync(
    "qa/contact-database-report.json",
    JSON.stringify(output, null, 2),
  );
  console.log(JSON.stringify(output));
} finally {
  await db.end();
}
