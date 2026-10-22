import type { Invoice } from "./model";
import { InvoiceError } from "./store";
import { services } from "../data";
import {
  pricingServices,
  PRICING_HOURLY_RATE,
  PRICING_MAX_HOURS,
} from "../pricing";

// Intentionally pinned: no connected-account header, shared STRIPE_SECRET_KEY,
// live key, or dashboard account switch can redirect invoice payments elsewhere.
export const THRIVE4_TEST_ACCOUNT = "acct_1USt0pLVzsWcldA8";
export function stripeTestReady() {
  return Boolean(process.env.THRIVE4_STRIPE_SECRET_KEY?.startsWith("sk_test_"));
}
export class StripeRequestError extends InvoiceError {
  constructor(
    message: string,
    public stripeCode: string | undefined,
    public resource: string,
  ) {
    super(message, 502);
  }
}
function secret() {
  const value = process.env.THRIVE4_STRIPE_SECRET_KEY;
  if (!value?.startsWith("sk_test_"))
    throw new InvoiceError(
      "Thrive4 Stripe test key is missing. Live keys are not allowed.",
      503,
    );
  return value;
}
async function call<T>(
  path: string,
  fields?: URLSearchParams,
  key?: string,
): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: fields ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret()}`,
      ...(fields
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    ...(fields ? { body: fields.toString() } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  }).catch(() => {
    throw new InvoiceError(
      "Could not connect to Thrive4 Stripe test mode. Please retry.",
      502,
    );
  });
  const result = await response.json();
  if (!response.ok)
    throw new StripeRequestError(
      `Stripe test request failed: ${String(result.error?.message || "Please retry.").replace(/[srp]k_(?:test|live)_[A-Za-z0-9]+/g, "[redacted]")}`,
      result.error?.code,
      path,
    );
  return result as T;
}
export async function verifyThrive4Account() {
  const account = await call<{
    id: string;
    business_profile?: { name?: string };
  }>("account");
  if (account.id !== THRIVE4_TEST_ACCOUNT)
    throw new InvoiceError(
      "Account mismatch. Only the pinned Thrive4 Cleaning sandbox is allowed. No payment changes were made.",
      403,
    );
  return account;
}
type Session = {
  id: string;
  livemode: boolean;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number;
  currency: string;
  expires_at: number;
  client_reference_id: string;
  metadata: {
    invoice_id?: string;
    revision?: string;
    app?: string;
    service?: string;
  };
  payment_intent: string | null;
};
function applySession(invoice: Invoice, session: Session) {
  if (
    session.livemode ||
    !session.id.startsWith("cs_test_") ||
    session.client_reference_id !== invoice.id ||
    session.metadata?.invoice_id !== invoice.id ||
    session.metadata?.revision !== String(invoice.revision) ||
    session.metadata?.app !== "thrive4-local-invoices" ||
    session.currency !== "aud" ||
    session.amount_total !== Math.round(invoice.amount * 100)
  )
    throw new InvoiceError(
      "Stripe session does not match this Thrive4 test invoice.",
      409,
    );
  if (
    session.url &&
    new URL(session.url).origin !== "https://checkout.stripe.com"
  )
    throw new InvoiceError("Stripe returned an unexpected checkout URL.", 502);
  invoice.checkout = {
    accountId: THRIVE4_TEST_ACCOUNT,
    sessionId: session.id,
    url: session.url || invoice.checkout?.url || "",
    revision: invoice.revision,
    status: session.status,
    paymentStatus: session.payment_status,
    expiresAt: session.expires_at,
    paymentIntentId: session.payment_intent || undefined,
    paidAt:
      session.payment_status === "paid"
        ? invoice.checkout?.paidAt || new Date().toISOString()
        : undefined,
  };
  return invoice;
}
export async function syncStripeCheckout(invoice: Invoice) {
  if (!invoice.checkout) return invoice;
  await verifyThrive4Account();
  if (
    invoice.checkout.accountId !== THRIVE4_TEST_ACCOUNT ||
    !/^cs_test_[A-Za-z0-9]+$/.test(invoice.checkout.sessionId)
  )
    throw new InvoiceError(
      "This checkout is outside the Thrive4 sandbox.",
      403,
    );
  return applySession(
    invoice,
    await call<Session>(`checkout/sessions/${invoice.checkout.sessionId}`),
  );
}
export async function expireStripeCheckout(
  invoice: Invoice,
  allowPaidTestRecord = false,
) {
  if (!invoice.checkout) return;
  await syncStripeCheckout(invoice);
  if (invoice.checkout.paymentStatus === "paid" && !allowPaidTestRecord)
    throw new InvoiceError(
      "A paid test invoice cannot be edited or deleted. Create a new invoice instead.",
      409,
    );
  if (invoice.checkout.status === "open") {
    const session = await call<Session>(
      `checkout/sessions/${invoice.checkout.sessionId}/expire`,
      new URLSearchParams(),
    );
    applySession(invoice, session);
  }
}
export async function prepareInvoiceMutation(invoice: Invoice) {
  try {
    // Paid test records can be managed locally; no completed payment is altered.
    await expireStripeCheckout(invoice, true);
  } catch (error) {
    if (
      error instanceof StripeRequestError &&
      error.stripeCode === "resource_missing" &&
      error.resource === `checkout/sessions/${invoice.checkout?.sessionId}`
    )
      return;
    throw error;
  }
}
export async function createStripeCheckout(invoice: Invoice, origin: string) {
  await verifyThrive4Account();
  if (invoice.autopay)
    throw new InvoiceError(
      "This integration supports one-time test payments. Turn off autopay before generating a link.",
    );
  if (
    invoice.validUntil <
    new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" })
  )
    throw new InvoiceError("This invoice has expired. Update its dates first.");
  if (invoice.checkout) {
    await syncStripeCheckout(invoice);
    if (
      invoice.checkout.paymentStatus === "paid" ||
      invoice.checkout.status === "open"
    )
      return invoice;
  }
  const fields = new URLSearchParams({
    mode: "payment",
    customer_email: invoice.email,
    client_reference_id: invoice.id,
    "metadata[app]": "thrive4-local-invoices",
    "metadata[invoice_id]": invoice.id,
    "metadata[revision]": String(invoice.revision),
    "payment_intent_data[metadata][app]": "thrive4-local-invoices",
    "payment_intent_data[metadata][invoice_id]": invoice.id,
    "line_items[0][price_data][currency]": "aud",
    "line_items[0][price_data][unit_amount]": String(
      Math.round(invoice.amount * 100),
    ),
    "line_items[0][price_data][product_data][name]": `Thrive4 Cleaning · ${invoice.description}`,
    "line_items[0][quantity]": "1",
    success_url:
      process.env.THRIVE4_ADMIN_ONLINE === "true"
        ? `${origin}/payments/confirmation?session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/admin/review?id=${encodeURIComponent(invoice.id)}&checkout=success`,
    cancel_url: `${origin}/admin/review?id=${encodeURIComponent(invoice.id)}&checkout=cancelled`,
  });
  const session = await call<Session>(
    "checkout/sessions",
    fields,
    `thrive4-checkout-v2-${invoice.id}-${invoice.revision}-${invoice.checkout?.sessionId || "first"}`,
  );
  return applySession(invoice, session);
}

export async function createPricingCheckout(
  service: string,
  requestId: string,
  origin: string,
) {
  const selected = services.find((item) => item.slug === service);
  if (!selected || !pricingServices.some((slug) => slug === service))
    throw new InvoiceError("Choose a supported cleaning service.");
  await verifyThrive4Account();
  const fields = new URLSearchParams({
    mode: "payment",
    "adaptive_pricing[enabled]": "false",
    "metadata[app]": "thrive4-pricing-checkout",
    "metadata[service]": service,
    "payment_intent_data[metadata][app]": "thrive4-pricing-checkout",
    "payment_intent_data[metadata][service]": service,
    "line_items[0][price_data][currency]": "aud",
    "line_items[0][price_data][unit_amount]": String(PRICING_HOURLY_RATE * 100),
    "line_items[0][price_data][product_data][name]": `Thrive4 Cleaning · ${selected.name} (per person/hour)`,
    "line_items[0][price_data][product_data][description]": `Quantity = total person-hours (people × hours). AUD ${PRICING_HOURLY_RATE} per person/hour. One-time sandbox payment; appointment scheduling is separate.`,
    "line_items[0][quantity]": "1",
    "line_items[0][adjustable_quantity][enabled]": "true",
    "line_items[0][adjustable_quantity][minimum]": "1",
    "line_items[0][adjustable_quantity][maximum]": String(PRICING_MAX_HOURS),
    success_url: `${origin}/pricing/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?service=${encodeURIComponent(service)}`,
  });
  const session = await call<Session>(
    "checkout/sessions",
    fields,
    `thrive4-pricing-v2-${service}-${requestId}`,
  );
  if (
    session.livemode ||
    session.currency !== "aud" ||
    session.amount_total !== PRICING_HOURLY_RATE * 100 ||
    session.metadata?.app !== "thrive4-pricing-checkout" ||
    session.metadata?.service !== service ||
    !session.id.startsWith("cs_test_") ||
    !session.url ||
    new URL(session.url).origin !== "https://checkout.stripe.com"
  )
    throw new InvoiceError(
      "A valid Thrive4 test checkout was not returned.",
      502,
    );
  return { url: session.url, sessionId: session.id };
}

export async function verifyPricingPayment(id: string) {
  if (!/^cs_test_[A-Za-z0-9]+$/.test(id))
    throw new InvoiceError("Invalid test checkout reference.");
  await verifyThrive4Account();
  const session = await call<
    Omit<Session, "metadata"> & {
      metadata: { app?: string; service?: string };
      customer_details?: { name?: string; email?: string };
      created?: number;
    }
  >(`checkout/sessions/${id}`);
  if (
    session.id !== id ||
    session.livemode ||
    session.metadata?.app !== "thrive4-pricing-checkout" ||
    (!pricingServices.some((slug) => slug === session.metadata.service) &&
      session.metadata.service !== "deep-cleaning") ||
    session.currency !== "aud"
  )
    throw new InvoiceError(
      "This payment does not match a Thrive4 pricing checkout.",
      409,
    );
  const items = await call<{
    data: {
      quantity: number;
      price: { unit_amount: number; currency: string };
    }[];
    has_more: boolean;
  }>(`checkout/sessions/${id}/line_items?limit=2`);
  const item = items.data[0];
  if (
    items.has_more ||
    items.data.length !== 1 ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    item.quantity > PRICING_MAX_HOURS ||
    ![6000, PRICING_HOURLY_RATE * 100].includes(item.price.unit_amount) ||
    item.price.currency !== "aud" ||
    session.amount_total !== item.quantity * item.price.unit_amount
  )
    throw new InvoiceError(
      "Checkout hours and amount could not be verified.",
      409,
    );
  return {
    sessionId: id,
    // Retired service/rate remain readable only for historical payment documents.
    service:
      services.find((s) => s.slug === session.metadata.service)?.name ||
      "Deep Cleaning",
    serviceSlug: session.metadata.service!,
    hourlyRate: item.price.unit_amount / 100,
    hours: item.quantity,
    amount: session.amount_total / 100,
    paid: session.status === "complete" && session.payment_status === "paid",
    paymentIntentId: session.payment_intent,
    customerName: session.customer_details?.name || "Customer",
    customerEmail: session.customer_details?.email || "",
  };
}
export async function invoiceForCheckout(id: string) {
  if (!/^cs_test_[A-Za-z0-9]+$/.test(id))
    throw new InvoiceError("Invalid checkout reference.");
  await verifyThrive4Account();
  const session = await call<Session>(`checkout/sessions/${id}`);
  if (session.id !== id || session.livemode)
    throw new InvoiceError("Invalid Thrive4 test checkout.", 409);
  if (session.metadata?.app === "thrive4-pricing-checkout") return undefined;
  if (
    session.metadata?.app !== "thrive4-local-invoices" ||
    !/^[a-f0-9-]{36}$/i.test(session.metadata.invoice_id || "")
  )
    throw new InvoiceError("Invalid invoice checkout.", 409);
  return session.metadata.invoice_id;
}

export async function verifiedPaymentDetails(
  id: string,
  expected: {
    amount: number;
    app: string;
    invoiceId?: string;
    service?: string;
  },
) {
  if (!/^pi_[A-Za-z0-9]+$/.test(id))
    throw new InvoiceError("Payment reference is unavailable.", 409);
  await verifyThrive4Account();
  const payment = await call<{
    id: string;
    status: string;
    livemode: boolean;
    amount_received: number;
    currency: string;
    metadata: Record<string, string>;
    latest_charge: null | {
      paid: boolean;
      created: number;
      payment_method_details?: { card?: { brand: string; last4: string } };
    };
  }>(`payment_intents/${id}?expand[]=latest_charge`);
  if (
    payment.id !== id ||
    payment.livemode ||
    payment.status !== "succeeded" ||
    payment.currency !== "aud" ||
    payment.amount_received !== Math.round(expected.amount * 100) ||
    payment.metadata?.app !== expected.app ||
    (expected.invoiceId &&
      payment.metadata.invoice_id !== expected.invoiceId) ||
    (expected.service && payment.metadata.service !== expected.service) ||
    !payment.latest_charge?.paid
  )
    throw new InvoiceError(
      "The completed payment could not be verified for these documents.",
      409,
    );
  return {
    paidAt: new Date(payment.latest_charge.created * 1000).toISOString(),
    cardBrand: payment.latest_charge.payment_method_details?.card?.brand || "",
    cardLast4: payment.latest_charge.payment_method_details?.card?.last4 || "",
  };
}
