import { Pool, type PoolClient } from "pg";
import { readFileSync } from "node:fs";
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import type { Invoice } from "./model";
const state = globalThis as typeof globalThis & { thrive4InvoicePool?: Pool };
export const invoiceTransactionContext = new AsyncLocalStorage<PoolClient>();
export function onlineAdmin() {
  return process.env.THRIVE4_ADMIN_ONLINE === "true";
}
export function invoiceDatabase() {
  if (!process.env.THRIVE4_ADMIN_DATABASE_URL)
    throw new Error("Secure admin database is not configured.");
  if (!state.thrive4InvoicePool) {
    state.thrive4InvoicePool = new Pool({
      connectionString: process.env.THRIVE4_ADMIN_DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
        ca: readFileSync(
          path.join(process.cwd(), "certificates/supabase-root.crt"),
          "utf8",
        ),
      },
      max: 2,
      connectionTimeoutMillis: 12000,
      query_timeout: 15000,
      idleTimeoutMillis: 10000,
      application_name: "thrive4-admin",
    });
    state.thrive4InvoicePool.on("error", () =>
      console.error("Admin database connection closed."),
    );
  }
  return state.thrive4InvoicePool;
}
export async function databaseInvoiceTransaction<T>(
  operation: (items: Invoice[]) => Promise<T>,
) {
  const client = await invoiceDatabase().connect();
  try {
    await client.query("begin");
    const result = await client.query(
      "select invoices from thrive4_admin.workspace where id=1 for update",
    );
    if (!result.rows[0]) throw new Error("Admin workspace is not provisioned.");
    const items = result.rows[0].invoices as Invoice[];
    const response = await invoiceTransactionContext.run(client, () =>
      operation(items),
    );
    await client.query(
      "update thrive4_admin.workspace set invoices=$1::jsonb, updated_at=now() where id=1",
      [JSON.stringify(items)],
    );
    await client.query("commit");
    return response;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
