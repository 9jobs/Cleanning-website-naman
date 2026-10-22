import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  authenticatedAdmin,
  issueAdminSession,
  endAdminSession,
  verifyAdminCredentials,
  ADMIN_COOKIE,
} from "../src/lib/invoices/auth";
import { invoiceDatabase } from "../src/lib/invoices/database";
import {
  invoiceTransaction,
  saveInvoice,
  deleteInvoice,
  archiveInvoice,
} from "../src/lib/invoices/store";
import { invoiceSchema } from "../src/lib/invoices/model";
import type { NextRequest } from "next/server";
async function main() {
  process.env.THRIVE4_ADMIN_ONLINE = "true";
  const pool = invoiceDatabase();
  const rights = await pool.query(
    "select has_table_privilege(current_user,'public.contact_enquiries','select') allowed",
  );
  assert.equal(rights.rows[0].allowed, false);
  assert(
    await verifyAdminCredentials(
      process.env.THRIVE4_ADMIN_EMAIL!,
      process.env.THRIVE4_ADMIN_TEST_PASSWORD!,
    ),
  );
  const token = await issueAdminSession();
  const request = {
    cookies: {
      get: (name: string) =>
        name === ADMIN_COOKIE ? { value: token } : undefined,
    },
  } as NextRequest;
  assert(await authenticatedAdmin(request));
  await endAdminSession(request);
  assert.equal(await authenticatedAdmin(request), false);
  const data = invoiceSchema.parse({
    number: `T4-ONLINE-QA-${randomUUID().slice(0, 8)}`,
    name: "Online CRUD Test",
    email: "qa@example.com",
    phone: "",
    address: "",
    service: "house-cleaning",
    plan: "One-off",
    autopay: false,
    description: "Online CRUD test",
    hours: 1,
    hourlyRate: 70,
    amount: 70,
    invoiceDate: "2026-10-22",
    issuedDate: "2026-10-22",
    dueDate: "2026-10-29",
    validUntil: "2026-11-05",
    notes: "",
  });
  const saved = await invoiceTransaction(async (items) =>
    structuredClone(saveInvoice(items, data)),
  );
  try {
    await invoiceTransaction(async (items) => {
      const original = items.find((i) => i.id === saved.id)!;
      await archiveInvoice(original, "edit");
      saveInvoice(items, { ...data, hours: 2, amount: 140 }, saved.id, 1);
    });
    await assert.rejects(
      invoiceTransaction(async (items) => {
        deleteInvoice(items, saved.id, 1);
      }),
      /changed/,
    );
    const persisted = await pool.query(
      "select invoices from thrive4_admin.workspace where id=1",
    );
    assert.equal(
      persisted.rows[0].invoices.find((i: { id: string }) => i.id === saved.id)
        .amount,
      140,
    );
    await invoiceTransaction(async (items) => {
      const current = items.find((i) => i.id === saved.id)!;
      await archiveInvoice(current, "delete");
      deleteInvoice(items, saved.id, 2);
    });
    const history = await pool.query(
      "select count(*)::int count from thrive4_admin.history where invoice_id=$1",
      [saved.id],
    );
    assert.equal(history.rows[0].count, 2);
    console.log(
      "PASS: restricted database role; persistent login/logout; transactional create/edit/delete; stale revision rejected; rollback and history preserved. No email/payment created.",
    );
  } finally {
    await invoiceTransaction(async (items) => {
      const i = items.find((i) => i.id === saved.id);
      if (i) deleteInvoice(items, i.id, i.revision);
    });
    await pool.end();
  }
}
main().catch((error) => {
  console.error("Online verification failed:", error.code || error.message);
  process.exitCode = 1;
});
