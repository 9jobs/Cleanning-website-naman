// Run locally: node --env-file=.env.local scripts/migrate-quick-quote.mjs
import fs from "node:fs";
import pg from "pg";

const connectionString =
  process.env.CONTACT_ADMIN_DATABASE_URL || process.env.CONTACT_DATABASE_URL;
if (!connectionString)
  throw new Error("Configure the existing server-only database URL first.");
const db = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
  },
  connectionTimeoutMillis: 12000,
});
try {
  await db.connect();
  await db.query(
    fs.readFileSync(
      "supabase/migrations/003_quick_quote_enquiries.sql",
      "utf8",
    ),
  );
  const { rows } = await db.query(`select
    (select rowsecurity from pg_tables where schemaname='public' and tablename='quick_quote_enquiries') as rls_enabled,
    has_table_privilege('anon','public.quick_quote_enquiries','SELECT') as public_read,
    has_table_privilege('anon','public.quick_quote_enquiries','INSERT') as public_write,
    has_table_privilege('authenticated','public.quick_quote_enquiries','SELECT') as authenticated_read`);
  console.log(JSON.stringify({ quickQuoteTableReady: true, ...rows[0] }));
} catch (error) {
  console.error(
    JSON.stringify({
      quickQuoteTableReady: false,
      code: error.code || "DATABASE_ERROR",
    }),
  );
  process.exitCode = 1;
} finally {
  await db.end();
}
