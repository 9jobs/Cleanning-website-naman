import fs from "node:fs";
import pg from "pg";
const client = new pg.Client({
  connectionString: process.env.CONTACT_ADMIN_DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
  },
  connectionTimeoutMillis: 12000,
});
try {
  await client.connect();
  await client.query(
    fs.readFileSync("supabase/migrations/005_stripe_webhooks.sql", "utf8"),
  );
  console.log(
    "Private webhook event ledger provisioned; public access revoked.",
  );
} catch (error) {
  console.error("Webhook migration failed:", error.code || "DATABASE_ERROR");
  process.exitCode = 1;
} finally {
  await client.end();
}
