import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  createPricingCheckout,
  verifyPricingPayment,
  verifiedPaymentDetails,
  THRIVE4_LIVE_ACCOUNT,
} from "../src/lib/invoices/stripe";

test("live pricing verifies the new rate and historical AUD 70 without allowing arbitrary rates", async () => {
  const old = process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY;
  process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY = "rk_live_unit_fixture";
  let unitAmount = 7900;
  const stub = mock.method(globalThis, "fetch", async (url: string) => {
    if (url.endsWith("/account"))
      return Response.json({ id: THRIVE4_LIVE_ACCOUNT });
    if (url.includes("/line_items?"))
      return Response.json({
        data: [
          { quantity: 2, price: { unit_amount: unitAmount, currency: "aud" } },
        ],
        has_more: false,
      });
    return Response.json({
      id: "cs_live_RATE",
      livemode: true,
      currency: "aud",
      amount_total: unitAmount * 2,
      status: "complete",
      payment_status: "paid",
      metadata: { app: "thrive4-pricing-checkout", service: "house-cleaning" },
    });
  });
  try {
    for (const rate of [7900, 7000]) {
      unitAmount = rate;
      const result = await verifyPricingPayment("cs_live_RATE");
      assert.equal(result.hourlyRate, rate / 100);
      assert.equal(result.amount, (rate * 2) / 100);
      assert.equal(result.paid, true);
    }
    unitAmount = 7500;
    await assert.rejects(
      verifyPricingPayment("cs_live_RATE"),
      /hours and amount/,
    );
  } finally {
    stub.mock.restore();
    if (old === undefined) delete process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY;
    else process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY = old;
  }
});

test("live Checkout uses only the dedicated restricted key and pinned Thrive4 live account", async () => {
  const keys = ["THRIVE4_STRIPE_MODE", "THRIVE4_STRIPE_LIVE_SECRET_KEY"];
  const old = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  process.env.THRIVE4_STRIPE_MODE = "live";
  process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY = "rk_live_unit_fixture";
  let account = THRIVE4_LIVE_ACCOUNT,
    writes = 0;
  const stub = mock.method(
    globalThis,
    "fetch",
    async (url: string, options: RequestInit) => {
      const headers = options.headers as Record<string, string>;
      assert.equal(headers.Authorization, "Bearer rk_live_unit_fixture");
      assert(!headers["Stripe-Account"]);
      if (url.endsWith("/account")) return Response.json({ id: account });
      writes++;
      const fields = new URLSearchParams(String(options.body));
      assert.equal(
        fields.get("line_items[0][price_data][unit_amount]"),
        "7900",
      );
      return Response.json({
        id: "cs_live_UNIT",
        url: "https://checkout.stripe.com/c/pay/cs_live_UNIT",
        livemode: true,
        currency: "aud",
        amount_total: 7900,
        metadata: {
          app: "thrive4-pricing-checkout",
          service: "house-cleaning",
        },
      });
    },
  );
  try {
    const result = await createPricingCheckout(
      "house-cleaning",
      "fixture",
      "https://example.com",
    );
    assert.equal(result.sessionId, "cs_live_UNIT");
    assert.equal(writes, 1);
    account = "acct_UNRELATED";
    await assert.rejects(
      createPricingCheckout(
        "house-cleaning",
        "fixture2",
        "https://example.com",
      ),
      /Account mismatch/,
    );
    assert.equal(writes, 1);
  } finally {
    stub.mock.restore();
    for (const key of keys) {
      if (old[key] === undefined) delete process.env[key];
      else process.env[key] = old[key];
    }
  }
});

test("live receipts require succeeded live payment, exact amount and matching app", async () => {
  const old = process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY;
  process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY = "rk_live_unit_fixture";
  const base = {
    id: "pi_UNIT",
    status: "succeeded",
    livemode: true,
    currency: "aud",
    amount_received: 7000,
    metadata: { app: "thrive4-pricing-checkout", service: "house-cleaning" },
    latest_charge: {
      paid: true,
      created: 1792648800,
      payment_method_details: { card: { brand: "visa", last4: "4242" } },
    },
  };
  let result = base;
  const stub = mock.method(globalThis, "fetch", async (url: string) =>
    Response.json(
      url.endsWith("/account") ? { id: THRIVE4_LIVE_ACCOUNT } : result,
    ),
  );
  const expected = {
    app: "thrive4-pricing-checkout",
    service: "house-cleaning",
    amount: 70,
    live: true,
  };
  try {
    assert.equal(
      (await verifiedPaymentDetails("pi_UNIT", expected)).cardLast4,
      "4242",
    );
    for (const change of [
      { livemode: false },
      { amount_received: 1 },
      { status: "processing" },
    ]) {
      result = { ...base, ...change };
      await assert.rejects(
        verifiedPaymentDetails("pi_UNIT", expected),
        /could not be verified/,
      );
    }
  } finally {
    stub.mock.restore();
    if (old === undefined) delete process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY;
    else process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY = old;
  }
});
