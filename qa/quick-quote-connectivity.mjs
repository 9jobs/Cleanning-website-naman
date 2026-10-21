import fs from "node:fs";
import pg from "pg";
import nodemailer from "nodemailer";
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
    `select has_schema_privilege(current_user,'public','CREATE') as can_create,has_table_privilege(current_user,'public.contact_enquiries','INSERT') as contact_write,has_table_privilege(current_user,'public.contact_request_limits','INSERT,UPDATE') as rate_limit_write, to_regclass('public.quick_quote_enquiries') is not null as quick_quote_table_exists`,
  );
  console.log(JSON.stringify({ databaseConnected: true, ...rows[0] }));
} catch (e) {
  console.log(
    JSON.stringify({
      databaseConnected: false,
      code: e.code || "DATABASE_ERROR",
    }),
  );
  process.exitCode = 1;
} finally {
  await db.end();
}
const mail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.CONTACT_SMTP_USER,
    pass: process.env.CONTACT_SMTP_PASSWORD?.replace(/\s/g, ""),
  },
  connectionTimeout: 15000,
});
try {
  await mail.verify();
  console.log(JSON.stringify({ smtpAuthenticated: true, noEmailSent: true }));
} catch (e) {
  console.log(
    JSON.stringify({ smtpAuthenticated: false, code: e.code || "SMTP_ERROR" }),
  );
  process.exitCode = 1;
} finally {
  mail.close();
}
