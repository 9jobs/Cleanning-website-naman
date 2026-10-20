// Run: node --env-file=.env.local scripts/migrate-contact.mjs
// Credentials are read from ignored environment configuration, never arguments.
import fs from "node:fs";
import pg from "pg";
const connectionString =
  process.env.CONTACT_ADMIN_DATABASE_URL || process.env.CONTACT_DATABASE_URL;
if (!connectionString)
  throw new Error("Set CONTACT_ADMIN_DATABASE_URL locally before migrating.");
const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
  },
  connectionTimeoutMillis: 12000,
});
try {
  await client.connect();
  await client.query(
    fs.readFileSync("supabase/migrations/002_contact_enquiries.sql", "utf8"),
  );
  const result =
    await client.query(`select tablename, rowsecurity from pg_tables
    where schemaname='public' and tablename in ('contact_enquiries','contact_request_limits')`);
  console.log(JSON.stringify({ migrated: true, tables: result.rows }));
} catch (error) {
  console.error(
    JSON.stringify({ migrated: false, code: error.code || "DATABASE_ERROR" }),
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
