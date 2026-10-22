import fs from "node:fs";
import crypto from "node:crypto";
import pg from "pg";
const adminUrl = process.env.CONTACT_ADMIN_DATABASE_URL;
if (!adminUrl)
  throw new Error(
    "Configure the existing site's migration credential locally.",
  );
const role = "thrive4_invoice_app";
const password = crypto.randomBytes(36).toString("base64url");
const client = new pg.Client({
  connectionString: adminUrl,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
  },
  connectionTimeoutMillis: 12000,
});
try {
  await client.connect();
  const exists = await client.query("select 1 from pg_roles where rolname=$1", [
    role,
  ]);
  if (exists.rowCount && !process.env.THRIVE4_ADMIN_DATABASE_URL)
    throw new Error(
      "Existing admin role requires its saved runtime configuration. Refusing to rotate it.",
    );
  if (!exists.rowCount) {
    const sql = await client.query(
      "select format('create role %I login password %L nosuperuser nocreatedb nocreaterole noreplication', $1::text,$2::text) sql",
      [role, password],
    );
    await client.query(sql.rows[0].sql);
  }
  await client.query(
    fs.readFileSync("supabase/migrations/004_admin_invoices.sql", "utf8"),
  );
  await client.query(
    `grant usage on schema thrive4_admin to ${role}; grant select,insert,update,delete on all tables in schema thrive4_admin to ${role}`,
  );
  for (const table of ["workspace", "history", "sessions", "login_limit"]) {
    await client.query(
      `drop policy if exists admin_runtime on thrive4_admin.${table}`,
    );
    await client.query(
      `create policy admin_runtime on thrive4_admin.${table} to ${role} using(true) with check(true)`,
    );
  }
  if (!exists.rowCount) {
    const runtime = new URL(adminUrl);
    const suffix = decodeURIComponent(runtime.username)
      .split(".")
      .slice(1)
      .join(".");
    runtime.username = role + (suffix ? "." + suffix : "");
    runtime.password = password;
    fs.appendFileSync(
      ".env.local",
      `\nTHRIVE4_ADMIN_DATABASE_URL=${runtime.toString()}\n`,
    );
  }
  console.log(
    "Admin schema provisioned with isolated runtime role, RLS, private sessions and history. Credentials saved only in ignored local configuration.",
  );
} catch (error) {
  console.error("Admin migration failed:", error.code || "CONFIGURATION_ERROR");
  process.exitCode = 1;
} finally {
  await client.end();
}
