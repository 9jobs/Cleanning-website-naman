import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import {
  documentReferences,
  getPaymentDocument,
  type PaymentDocument,
} from "../src/lib/payments/documents";
import { paymentPdf } from "../src/lib/payments/pdf";
import {
  verifiedPaymentDetails,
  THRIVE4_TEST_ACCOUNT,
} from "../src/lib/invoices/stripe";

test("document references are stable and unique per checkout", () => {
  assert.deepEqual(
    documentReferences("checkout1"),
    documentReferences("checkout1"),
  );
  assert.notDeepEqual(
    documentReferences("checkout1"),
    documentReferences("checkout2"),
  );
});

test("documents require exactly one payment reference", async () => {
  await assert.rejects(getPaymentDocument({}), /Choose one/);
  await assert.rejects(
    getPaymentDocument({ sessionId: "x", invoiceId: "y" }),
    /Choose one/,
  );
});

test("receipt details reject unpaid, wrong-amount, live and unrelated payments", async () => {
  const old = process.env.THRIVE4_STRIPE_SECRET_KEY;
  process.env.THRIVE4_STRIPE_SECRET_KEY = "sk_test_unit_fake";
  const base = {
    id: "pi_UNIT",
    status: "succeeded",
    livemode: false,
    currency: "aud",
    amount_received: 6000,
    metadata: { app: "thrive4-pricing-checkout", service: "deep-cleaning" },
    latest_charge: {
      paid: true,
      created: 1792627200,
      payment_method_details: { card: { brand: "visa", last4: "4242" } },
    },
  };
  let payment = base;
  let account = THRIVE4_TEST_ACCOUNT;
  const stub = mock.method(globalThis, "fetch", async (url: string) =>
    Response.json(url.endsWith("/account") ? { id: account } : payment),
  );
  const expected = {
    amount: 60,
    app: "thrive4-pricing-checkout",
    service: "deep-cleaning",
  };
  try {
    const details = await verifiedPaymentDetails("pi_UNIT", expected);
    assert.equal(details.cardLast4, "4242");
    assert.deepEqual(Object.keys(details).sort(), [
      "cardBrand",
      "cardLast4",
      "paidAt",
    ]);
    for (const patch of [
      { status: "processing" },
      { amount_received: 1 },
      { livemode: true },
      { currency: "usd" },
      { metadata: { app: "other", service: "deep-cleaning" } },
      { latest_charge: { ...base.latest_charge, paid: false } },
    ]) {
      payment = { ...base, ...patch };
      await assert.rejects(
        verifiedPaymentDetails("pi_UNIT", expected),
        /could not be verified/,
      );
    }
    account = "acct_other";
    await assert.rejects(
      verifiedPaymentDetails("pi_UNIT", expected),
      /Account mismatch/,
    );
  } finally {
    stub.mock.restore();
    if (old === undefined) delete process.env.THRIVE4_STRIPE_SECRET_KEY;
    else process.env.THRIVE4_STRIPE_SECRET_KEY = old;
  }
});

test("invoice and receipt produce separate one-page A4 PDFs", async () => {
  const data: PaymentDocument = {
    key: "sample",
    ...documentReferences("sample"),
    service: "Deep Cleaning",
    hours: 2,
    hourlyRate: 60,
    amount: 120,
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    paidAt: "2026-10-22T10:00:00Z",
    paymentIntentId: "pi_UNIT",
    cardBrand: "visa",
    cardLast4: "4242",
  };
  for (const kind of ["invoice", "receipt"] as const) {
    const bytes = await paymentPdf(data, kind);
    const pdf = await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(), 1);
    assert.match(pdf.getTitle()!, new RegExp(kind));
    assert.equal(Math.round(pdf.getPage(0).getHeight()), 842);
    assert(bytes.length > 1000);
  }
});
