import fs from "node:fs";
import pg from "pg";
const client = new pg.Client({
  connectionString: process.env.THRIVE4_ADMIN_DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("certificates/supabase-root.crt", "utf8"),
  },
  connectionTimeoutMillis: 12000,
});
try {
  await client.connect();
  await client.query("begin");
  const existing = await client.query(
    "select invoices from thrive4_admin.workspace where id=1 for update",
  );
  const local = JSON.parse(
    fs.readFileSync(".local-admin/invoices.json", "utf8"),
  );
  if (existing.rows[0].invoices.length) throw new Error("NONEMPTY_WORKSPACE");
  await client.query(
    "update thrive4_admin.workspace set invoices=$1::jsonb where id=1",
    [JSON.stringify(local)],
  );
  for (const name of fs.readdirSync(".local-admin/history")) {
    if (!name.endsWith(".json")) continue;
    const record = JSON.parse(
      fs.readFileSync(".local-admin/history/" + name, "utf8"),
    );
    await client.query(
      "insert into thrive4_admin.history(invoice_id,revision,action,invoice,archived_at) values($1,$2,$3,$4::jsonb,$5) on conflict do nothing",
      [
        record.invoice.id,
        record.invoice.revision,
        record.action,
        JSON.stringify(record.invoice),
        record.archivedAt,
      ],
    );
  }
  await client.query("commit");
  console.log(
    JSON.stringify({ importedInvoices: local.length, historyPreserved: true }),
  );
} catch (error) {
  await client.query("rollback").catch(() => {});
  console.error("Import failed:", error.code || error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
