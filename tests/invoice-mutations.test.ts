import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  prepareInvoiceMutation,
  THRIVE4_TEST_ACCOUNT,
} from "../src/lib/invoices/stripe";
import type { Invoice } from "../src/lib/invoices/model";

test("removed sandbox sessions allow local edit/delete, while account and network failures remain blocked", async () => {
  const previous = process.env.THRIVE4_STRIPE_SECRET_KEY;
  process.env.THRIVE4_STRIPE_SECRET_KEY = "sk_test_unit_fake";
  const invoice = {
    id: "test",
    revision: 1,
    amount: 70,
    checkout: {
      accountId: THRIVE4_TEST_ACCOUNT,
      sessionId: "cs_test_REMOVED",
      paymentStatus: "unpaid",
      status: "open",
    },
  } as Invoice;
  const saved = structuredClone(invoice);
  let account = THRIVE4_TEST_ACCOUNT;
  let code = "resource_missing";
  let calls = 0;
  const stub = mock.method(
    globalThis,
    "fetch",
    async (url: string, options: RequestInit) => {
      assert.equal(options.method, "GET");
      calls++;
      if (url.endsWith("/account")) return Response.json({ id: account });
      return Response.json(
        { error: { message: "Checkout unavailable", code } },
        { status: 404 },
      );
    },
  );
  try {
    await prepareInvoiceMutation(invoice);
    assert.deepEqual(invoice, saved);
    code = "api_connection_error";
    await assert.rejects(
      prepareInvoiceMutation(invoice),
      /Checkout unavailable/,
    );
    account = "acct_OTHER";
    calls = 0;
    await assert.rejects(prepareInvoiceMutation(invoice), /Account mismatch/);
    assert.equal(calls, 1);
  } finally {
    stub.mock.restore();
    if (previous === undefined) delete process.env.THRIVE4_STRIPE_SECRET_KEY;
    else process.env.THRIVE4_STRIPE_SECRET_KEY = previous;
  }
});
