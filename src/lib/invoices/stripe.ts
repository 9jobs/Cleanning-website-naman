import type { Invoice } from "./model";
import {
  pricingBookingDetailsSchema,
  type PricingBookingDetails,
} from "../pricing-booking-validation";
import { InvoiceError } from "./store";
import { services } from "../data";
import {
  pricingServices,
  PRICING_HOURLY_RATE,
  PRICING_MAX_HOURS,
} from "../pricing";

import {
  THRIVE4_TEST_ACCOUNT,
  THRIVE4_LIVE_ACCOUNT,
  stripeLiveMode,
  stripeAccount,
  checkoutLiveMode,
} from "./stripe-mode";
export {
  THRIVE4_TEST_ACCOUNT,
  THRIVE4_LIVE_ACCOUNT,
  stripeLiveMode,
} from "./stripe-mode";
export function stripeTestReady() {
  // Retain the existing admin API field name; readiness follows the selected mode.
  return stripeLiveMode()
    ? /^(sk|rk)_live_/.test(process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY || "")
    : Boolean(process.env.THRIVE4_STRIPE_SECRET_KEY?.startsWith("sk_test_"));
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
function secret(live = stripeLiveMode()) {
  if (live) {
    const value = process.env.THRIVE4_STRIPE_LIVE_SECRET_KEY;
    if (!value || !/^(sk|rk)_live_/.test(value))
      throw new InvoiceError("Thrive4 live Stripe key is not configured.", 503);
    return value;
  }
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
  live = stripeLiveMode(),
): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: fields ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret(live)}`,
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
      "Could not connect to Thrive4 Stripe. Please retry.",
      502,
    );
  });
  const result = await response.json();
  if (!response.ok)
    throw new StripeRequestError(
      `Stripe request failed: ${String(result.error?.message || "Please retry.").replace(/[srp]k_(?:test|live)_[A-Za-z0-9]+/g, "[redacted]")}`,
      result.error?.code,
      path,
    );
  return result as T;
}
export async function verifyThrive4Account(live = stripeLiveMode()) {
  const account = await call<{
    id: string;
    business_profile?: { name?: string };
  }>("account", undefined, undefined, live);
  if (account.id !== stripeAccount(live))
    throw new InvoiceError(
      "Account mismatch. Only the pinned Thrive4 Stripe account is allowed. No payment changes were made.",
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
function applySession(
  invoice: Invoice,
  session: Session,
  live = stripeLiveMode(),
) {
  if (
    session.livemode !== live ||
    !session.id.startsWith(live ? "cs_live_" : "cs_test_") ||
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
    accountId: stripeAccount(live),
    livemode: live,
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
  const live = invoice.checkout.accountId === THRIVE4_LIVE_ACCOUNT;
  await verifyThrive4Account(live);
  if (
    invoice.checkout.accountId !== stripeAccount(live) ||
    !new RegExp(
      live ? "^cs_live_[A-Za-z0-9]+$" : "^cs_test_[A-Za-z0-9]+$",
    ).test(invoice.checkout.sessionId)
  )
    throw new InvoiceError(
      "This checkout is outside the pinned Thrive4 account.",
      403,
    );
  return applySession(
    invoice,
    await call<Session>(
      `checkout/sessions/${invoice.checkout.sessionId}`,
      undefined,
      undefined,
      live,
    ),
    live,
  );
}
export async function expireStripeCheckout(
  invoice: Invoice,
  allowPaidTestRecord = false,
) {
  if (!invoice.checkout) return;
  await syncStripeCheckout(invoice);
  if (
    invoice.checkout.paymentStatus === "paid" &&
    (!allowPaidTestRecord ||
      invoice.checkout.accountId === THRIVE4_LIVE_ACCOUNT)
  )
    throw new InvoiceError(
      "A paid invoice cannot be edited or deleted. Create a new invoice instead.",
      409,
    );
  if (invoice.checkout.status === "open") {
    const session = await call<Session>(
      `checkout/sessions/${invoice.checkout.sessionId}/expire`,
      new URLSearchParams(),
      undefined,
      invoice.checkout.accountId === THRIVE4_LIVE_ACCOUNT,
    );
    applySession(
      invoice,
      session,
      invoice.checkout.accountId === THRIVE4_LIVE_ACCOUNT,
    );
  }
}
export async function prepareInvoiceMutation(invoice: Invoice) {
  try {
    // Paid test records can be managed locally; no completed payment is altered.
    await expireStripeCheckout(invoice, true);
  } catch (error) {
    if (
      invoice.checkout?.accountId === THRIVE4_TEST_ACCOUNT &&
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
      "This integration supports one-time payments. Turn off autopay before generating a link.",
    );
  if (
    invoice.validUntil <
    new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" })
  )
    throw new InvoiceError("This invoice has expired. Update its dates first.");
  if (invoice.checkout) {
    if (invoice.checkout.accountId !== stripeAccount())
      throw new InvoiceError(
        "This invoice belongs to the previous Stripe mode. Create a new invoice for a live payment.",
        409,
      );
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
  booking?: PricingBookingDetails,
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
    "line_items[0][price_data][product_data][description]": `Quantity = total person-hours (people × hours). AUD ${PRICING_HOURLY_RATE} per person/hour. One-time ${stripeLiveMode() ? "payment" : "sandbox payment"}; appointment scheduling is separate.`,
    "line_items[0][quantity]": "1",
    "line_items[0][adjustable_quantity][enabled]": "true",
    "line_items[0][adjustable_quantity][minimum]": "1",
    "line_items[0][adjustable_quantity][maximum]": String(PRICING_MAX_HOURS),
    success_url: `${origin}/pricing/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?service=${encodeURIComponent(service)}`,
  });
  if (booking) {
    const details = pricingBookingDetailsSchema.parse(booking);
    fields.set("customer_email", details.email);
    fields.set("metadata[booking_version]", "1");
    for (const [key, value] of Object.entries(details))
      fields.set(`metadata[booking_${key}]`, value);
  }
  const session = await call<Session>(
    "checkout/sessions",
    fields,
    `thrive4-pricing-v2-${service}-${requestId}`,
  );
  if (
    session.livemode !== stripeLiveMode() ||
    session.currency !== "aud" ||
    session.amount_total !== PRICING_HOURLY_RATE * 100 ||
    session.metadata?.app !== "thrive4-pricing-checkout" ||
    session.metadata?.service !== service ||
    !session.id.startsWith(stripeLiveMode() ? "cs_live_" : "cs_test_") ||
    !session.url ||
    new URL(session.url).origin !== "https://checkout.stripe.com"
  )
    throw new InvoiceError("A valid Thrive4 checkout was not returned.", 502);
  return { url: session.url, sessionId: session.id };
}

export async function verifyPricingPayment(id: string) {
  let live: boolean;
  try {
    live = checkoutLiveMode(id);
  } catch {
    throw new InvoiceError("Invalid checkout reference.");
  }
  await verifyThrive4Account(live);
  const session = await call<
    Omit<Session, "metadata"> & {
      metadata: {
        app?: string;
        service?: string;
        [key: string]: string | undefined;
      };
      customer_details?: { name?: string; email?: string };
      created?: number;
    }
  >(`checkout/sessions/${id}`, undefined, undefined, live);
  if (
    session.id !== id ||
    session.livemode !== live ||
    session.metadata?.app !== "thrive4-pricing-checkout" ||
    (!pricingServices.some((slug) => slug === session.metadata.service) &&
      (live || session.metadata.service !== "deep-cleaning")) ||
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
  }>(`checkout/sessions/${id}/line_items?limit=2`, undefined, undefined, live);
  const item = items.data[0];
  if (
    items.has_more ||
    items.data.length !== 1 ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    item.quantity > PRICING_MAX_HOURS ||
    !(
      live
        ? [7000, PRICING_HOURLY_RATE * 100]
        : [6000, 7000, PRICING_HOURLY_RATE * 100]
    ).includes(item.price.unit_amount) ||
    item.price.currency !== "aud" ||
    session.amount_total !== item.quantity * item.price.unit_amount
  )
    throw new InvoiceError(
      "Checkout hours and amount could not be verified.",
      409,
    );
  return {
    sessionId: id,
    live,
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
    booking:
      session.metadata.booking_version === "1"
        ? pricingBookingDetailsSchema.parse(
            Object.fromEntries(
              ["name", "email", "phone", "address", "date", "time"].map(
                (key) => [key, session.metadata[`booking_${key}`]],
              ),
            ),
          )
        : undefined,
  };
}
export async function invoiceForCheckout(id: string) {
  let live: boolean;
  try {
    live = checkoutLiveMode(id);
  } catch {
    throw new InvoiceError("Invalid checkout reference.");
  }
  await verifyThrive4Account(live);
  const session = await call<Session>(
    `checkout/sessions/${id}`,
    undefined,
    undefined,
    live,
  );
  if (session.id !== id || session.livemode !== live)
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
    live?: boolean;
  },
) {
  if (!/^pi_[A-Za-z0-9]+$/.test(id))
    throw new InvoiceError("Payment reference is unavailable.", 409);
  const live = expected.live ?? stripeLiveMode();
  await verifyThrive4Account(live);
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
  }>(
    `payment_intents/${id}?expand[]=latest_charge`,
    undefined,
    undefined,
    live,
  );
  if (
    payment.id !== id ||
    payment.livemode !== live ||
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
