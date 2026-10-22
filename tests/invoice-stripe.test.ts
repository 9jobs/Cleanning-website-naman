import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  createStripeCheckout,
  createPricingCheckout,
  verifyPricingPayment,
  syncStripeCheckout,
  expireStripeCheckout,
  prepareInvoiceMutation,
  THRIVE4_TEST_ACCOUNT,
} from "../src/lib/invoices/stripe";
import type { Invoice } from "../src/lib/invoices/model";
const invoice = (): Invoice => ({
  id: "e9101fdc-d87e-476a-8d65-8d86e8348d45",
  revision: 1,
  number: "T4-STRIPE-UNIT",
  name: "Test",
  email: "test@example.com",
  phone: "",
  address: "",
  invoiceDate: "2026-10-22",
  issuedDate: "2026-10-22",
  dueDate: "2099-10-29",
  validUntil: "2099-11-05",
  service: "house-cleaning",
  plan: "One-off",
  autopay: false,
  description: "House Cleaning",
  hours: 1.25,
  hourlyRate: 60,
  amount: 75,
  notes: "",
  createdAt: "2026-10-22T00:00:00Z",
  updatedAt: "2026-10-22T00:00:00Z",
});
function session(i: Invoice, extra = {}) {
  return {
    id: "cs_test_UNIT123",
    livemode: false,
    url: "https://checkout.stripe.com/c/pay/cs_test_UNIT123",
    status: "open",
    payment_status: "unpaid",
    amount_total: 7500,
    currency: "aud",
    expires_at: 2000000000,
    client_reference_id: i.id,
    metadata: {
      app: "thrive4-local-invoices",
      invoice_id: i.id,
      revision: String(i.revision),
    },
    payment_intent: null,
    ...extra,
  };
}
async function harness(
  run: (
    calls: { url: string; options: RequestInit }[],
    i: Invoice,
    set: (v: unknown) => void,
  ) => Promise<void>,
  account = THRIVE4_TEST_ACCOUNT,
  lineAmount = 6000,
) {
  const old = process.env.THRIVE4_STRIPE_SECRET_KEY;
  process.env.THRIVE4_STRIPE_SECRET_KEY = "sk_test_unit_fake";
  const i = invoice(),
    calls: { url: string; options: RequestInit }[] = [];
  let result: unknown = session(i);
  const stub = mock.method(
    globalThis,
    "fetch",
    async (url: string, options: RequestInit) => {
      calls.push({ url, options });
      assert(!("Stripe-Account" in (options.headers || {})));
      return Response.json(
        url.endsWith("/account")
          ? { id: account }
          : url.includes("/line_items?")
            ? {
                data: [
                  {
                    quantity: 2,
                    price: { unit_amount: lineAmount, currency: "aud" },
                  },
                ],
                has_more: false,
              }
            : result,
      );
    },
  );
  try {
    await run(calls, i, (v) => {
      result = v;
    });
  } finally {
    stub.mock.restore();
    if (old === undefined) delete process.env.THRIVE4_STRIPE_SECRET_KEY;
    else process.env.THRIVE4_STRIPE_SECRET_KEY = old;
  }
}
test("Stripe refuses a different account before making any payment write", () =>
  harness(async (calls, i) => {
    await assert.rejects(
      () => createStripeCheckout(i, "http://localhost:4317"),
      /Account mismatch/,
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.method, "GET");
    assert.equal(i.checkout, undefined);
  }, "acct_OTHER"));
test("Stripe rejects live credentials before any request", () =>
  harness(async (calls, i) => {
    process.env.THRIVE4_STRIPE_SECRET_KEY = "sk_live_not_allowed";
    await assert.rejects(
      () => createStripeCheckout(i, "http://localhost:4317"),
      /Live keys/,
    );
    assert.equal(calls.length, 0);
  }));
test("Checkout uses server invoice amount, AUD, metadata, and idempotency; an open link is reused", () =>
  harness(async (calls, i) => {
    await createStripeCheckout(i, "http://localhost:4317");
    const post = calls.find((c) => c.options.method === "POST")!;
    const fields = new URLSearchParams(String(post.options.body));
    assert.equal(fields.get("line_items[0][price_data][unit_amount]"), "7500");
    assert.equal(fields.get("line_items[0][price_data][currency]"), "aud");
    assert.equal(fields.get("mode"), "payment");
    assert.equal(fields.get("metadata[invoice_id]"), i.id);
    assert(!fields.has("payment_method_types[0]"));
    assert(
      (post.options.headers as Record<string, string>)[
        "Idempotency-Key"
      ].includes(i.id),
    );
    assert.equal(i.checkout?.accountId, THRIVE4_TEST_ACCOUNT);
    await createStripeCheckout(i, "http://localhost:4317");
    assert.equal(calls.filter((c) => c.options.method === "POST").length, 1);
  }));
test("Stripe status reconciliation rejects wrong amounts, revisions and live sessions", async () => {
  for (const change of [
    { amount_total: 1 },
    { currency: "usd" },
    { livemode: true },
    { client_reference_id: "other" },
    { metadata: { app: "thrive4-local-invoices", revision: "2" } },
  ])
    await harness(async (_calls, i, set) => {
      await createStripeCheckout(i, "http://localhost:4317");
      set(session(i, change));
      await assert.rejects(() => syncStripeCheckout(i), /does not match/);
      assert.equal(i.checkout?.paymentStatus, "unpaid");
    });
});
test("Only Stripe paid status marks a test invoice paid; local record management never changes the charge", () =>
  harness(async (_calls, i, set) => {
    await createStripeCheckout(i, "http://localhost:4317");
    set(
      session(i, {
        status: "complete",
        payment_status: "paid",
        url: null,
        payment_intent: "pi_test123",
      }),
    );
    await syncStripeCheckout(i);
    assert.equal(i.checkout?.paymentStatus, "paid");
    assert.equal(i.checkout?.paymentIntentId, "pi_test123");
    assert(i.checkout?.paidAt);
    await assert.rejects(
      () => expireStripeCheckout(i),
      /cannot be edited or deleted/,
    );
    const writes = _calls.filter(
      (call) => call.options.method === "POST",
    ).length;
    await prepareInvoiceMutation(i);
    assert.equal(
      _calls.filter((call) => call.options.method === "POST").length,
      writes,
    );
    assert.equal(i.checkout?.paymentStatus, "paid");
  }));
test("Unpaid checkout is expired before invoice edits/deletion", () =>
  harness(async (calls, i) => {
    await createStripeCheckout(i, "http://localhost:4317");
    await expireStripeCheckout(i);
    assert(
      calls.some(
        (c) => c.url.endsWith("/expire") && c.options.method === "POST",
      ),
    );
  }));
test("Autopay cannot silently create a recurring or one-off charge", () =>
  harness(async (calls, i) => {
    i.autopay = true;
    await assert.rejects(
      () => createStripeCheckout(i, "http://localhost:4317"),
      /Turn off autopay/,
    );
    assert.equal(calls.filter((c) => c.options.method === "POST").length, 0);
  }));

test("pricing checkout pins hourly AUD rate and lets customers select hours without subscriptions", () =>
  harness(async (calls, i, set) => {
    set(
      session(i, {
        amount_total: 7000,
        metadata: {
          app: "thrive4-pricing-checkout",
          service: "property-cleaning",
        },
      }),
    );
    await createPricingCheckout(
      "property-cleaning",
      "8ee9b35f-ff7f-4c01-99cd-7dccd9455995",
      "http://localhost:4317",
    );
    const post = calls.find((c) => c.options.method === "POST")!;
    const fields = new URLSearchParams(String(post.options.body));
    assert.equal(fields.get("line_items[0][price_data][unit_amount]"), "7000");
    assert.equal(
      fields.get("line_items[0][adjustable_quantity][enabled]"),
      "true",
    );
    assert.equal(
      fields.get("line_items[0][adjustable_quantity][maximum]"),
      "24",
    );
    assert.equal(fields.get("adaptive_pricing[enabled]"), "false");
    assert.equal(fields.get("mode"), "payment");
    assert.equal(fields.get("metadata[service]"), "property-cleaning");
    assert(!fields.has("line_items[0][price_data][recurring][interval]"));
  }));
test("retired services and the wrong Stripe account cannot create pricing payments", async () => {
  await harness(async (calls) => {
    await assert.rejects(
      () =>
        createPricingCheckout(
          "garden-cleaning",
          "test",
          "http://localhost:4317",
        ),
      /supported/,
    );
    assert.equal(calls.length, 0);
  });
  await harness(async (calls) => {
    await assert.rejects(
      () =>
        createPricingCheckout(
          "house-cleaning",
          "test",
          "http://localhost:4317",
        ),
      /Account mismatch/,
    );
    assert.equal(calls.length, 1);
  }, "acct_OTHER");
});
test("pricing success requires Stripe paid status and verifies selected hours against line items", () =>
  harness(async (_calls, i, set) => {
    const receipt = session(i, {
      status: "complete",
      payment_status: "paid",
      amount_total: 12000,
      metadata: { app: "thrive4-pricing-checkout", service: "house-cleaning" },
    });
    set(receipt);
    const result = await verifyPricingPayment(receipt.id);
    assert.equal(result.paid, true);
    assert.equal(result.hours, 2);
    assert.equal(result.amount, 120);
    set({ ...receipt, amount_total: 6000 });
    await assert.rejects(
      () => verifyPricingPayment(receipt.id),
      /hours and amount/,
    );
    set({ ...receipt, payment_status: "unpaid", status: "open" });
    assert.equal((await verifyPricingPayment(receipt.id)).paid, false);
  }));

test("current pricing verifies AUD 70 per person-hour", () =>
  harness(
    async (_calls, i, set) => {
      const paid = session(i, {
        status: "complete",
        payment_status: "paid",
        amount_total: 14000,
        metadata: {
          app: "thrive4-pricing-checkout",
          service: "house-cleaning",
        },
      });
      set(paid);
      const result = await verifyPricingPayment(paid.id);
      assert.equal(result.hourlyRate, 70);
      assert.equal(result.hours, 2);
      assert.equal(result.amount, 140);
    },
    THRIVE4_TEST_ACCOUNT,
    7000,
  ));
