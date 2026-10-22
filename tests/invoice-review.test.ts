import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { refreshReviewInvoices } from "../src/lib/invoices/review";
import {
  syncStripeCheckout,
  THRIVE4_TEST_ACCOUNT,
} from "../src/lib/invoices/stripe";
import type { Invoice } from "../src/lib/invoices/model";

test("a removed checkout cannot hide saved invoices or prevent another invoice from refreshing", async () => {
  const old = process.env.THRIVE4_STRIPE_SECRET_KEY;
  process.env.THRIVE4_STRIPE_SECRET_KEY = "sk_test_unit_fake";
  const item = (id: string, sessionId: string) =>
    ({
      id,
      revision: 1,
      amount: 60,
      checkout: {
        accountId: THRIVE4_TEST_ACCOUNT,
        sessionId,
        revision: 1,
        status: "open",
        paymentStatus: "unpaid",
        url: "https://checkout.stripe.com/test",
        expiresAt: 2000000000,
      },
    }) as Invoice;
  const missing = item("missing", "cs_test_MISSING");
  const good = item("good", "cs_test_GOOD");
  const saved = structuredClone(missing);
  const stub = mock.method(globalThis, "fetch", async (url: string) => {
    if (url.endsWith("/account"))
      return Response.json({ id: THRIVE4_TEST_ACCOUNT });
    if (url.endsWith("cs_test_MISSING"))
      return Response.json(
        {
          error: {
            message: "No such checkout.session",
            code: "resource_missing",
          },
        },
        { status: 404 },
      );
    return Response.json({
      id: "cs_test_GOOD",
      status: "complete",
      payment_status: "paid",
      currency: "aud",
      amount_total: 6000,
      livemode: false,
      client_reference_id: good.id,
      metadata: {
        app: "thrive4-local-invoices",
        invoice_id: good.id,
        revision: "1",
      },
      expires_at: 2000000000,
      url: null,
      payment_intent: "pi_TEST",
    });
  });
  try {
    const records = [missing, good];
    const warning = await refreshReviewInvoices(records);
    assert.match(warning!, /saved invoices are shown/);
    assert.equal(records.length, 2);
    assert.deepEqual(missing, saved);
    assert.equal(good.checkout?.paymentStatus, "paid");
    await assert.rejects(syncStripeCheckout(missing), /No such checkout/);
    assert.equal(await refreshReviewInvoices([good]), undefined);
  } finally {
    stub.mock.restore();
    if (old === undefined) delete process.env.THRIVE4_STRIPE_SECRET_KEY;
    else process.env.THRIVE4_STRIPE_SECRET_KEY = old;
  }
});
