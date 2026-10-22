import { createHmac, timingSafeEqual } from "node:crypto";
import { invoiceTransaction, InvoiceError } from "./store";
import { invoiceTransactionContext, onlineAdmin } from "./database";
import {
  invoiceForCheckout,
  syncStripeCheckout,
  verifyPricingPayment,
} from "./stripe";
import { THRIVE4_LIVE_ACCOUNT } from "./stripe-mode";
export type StripeWebhookEvent = {
  id: string;
  type: string;
  livemode: boolean;
  account?: string;
  data: { object: { id: string; metadata?: { app?: string } } };
};
export function verifyWebhookSignature(
  raw: Buffer,
  header: string,
  secret: string,
  now = Date.now(),
) {
  const parts = header.split(",").map((value) => value.trim().split("="));
  const times = parts.filter(([key]) => key === "t").map(([, value]) => value);
  const signatures = parts
    .filter(([key]) => key === "v1")
    .map(([, value]) => value);
  if (
    times.length !== 1 ||
    !/^\d{1,12}$/.test(times[0] || "") ||
    Math.abs(now / 1000 - Number(times[0])) > 300
  )
    throw new InvoiceError("Invalid webhook signature.", 400);
  const expected = createHmac("sha256", secret)
    .update(times[0] + ".")
    .update(raw)
    .digest();
  if (
    !signatures.some(
      (signature) =>
        /^[a-f0-9]{64}$/i.test(signature || "") &&
        timingSafeEqual(expected, Buffer.from(signature, "hex")),
    )
  )
    throw new InvoiceError("Invalid webhook signature.", 400);
  const event = JSON.parse(raw.toString("utf8")) as StripeWebhookEvent;
  if (
    !/^evt_[A-Za-z0-9]+$/.test(event.id || "") ||
    typeof event.type !== "string" ||
    typeof event.livemode !== "boolean" ||
    !event.data?.object
  )
    throw new InvoiceError("Invalid webhook event.", 400);
  return event;
}
export async function processStripeWebhook(event: StripeWebhookEvent) {
  if (
    !event.livemode ||
    (event.account && event.account !== THRIVE4_LIVE_ACCOUNT)
  )
    throw new InvoiceError("Wrong Stripe account or mode.", 400);
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
    ].includes(event.type)
  )
    return { ignored: true };
  const object = event.data.object;
  if (
    !["thrive4-local-invoices", "thrive4-pricing-checkout"].includes(
      object.metadata?.app || "",
    )
  )
    return { ignored: true };
  if (!/^cs_live_[A-Za-z0-9]+$/.test(object.id))
    throw new InvoiceError("Invalid live checkout.", 400);
  if (!onlineAdmin())
    throw new InvoiceError("Webhook storage is not configured.", 503);
  return invoiceTransaction(async (items) => {
    const db = invoiceTransactionContext.getStore()!;
    const recorded = await db.query(
      "insert into thrive4_admin.stripe_events(event_id,account_id,event_type,session_id) values($1,$2,$3,$4) on conflict do nothing returning event_id",
      [event.id, THRIVE4_LIVE_ACCOUNT, event.type, object.id],
    );
    if (!recorded.rowCount) return { duplicate: true };
    const invoiceId = await invoiceForCheckout(object.id);
    let outcome: string;
    if (invoiceId) {
      const invoice = items.find((item) => item.id === invoiceId);
      if (!invoice || invoice.checkout?.sessionId !== object.id)
        outcome = "invoice_not_current";
      else {
        await syncStripeCheckout(invoice);
        outcome = invoice.checkout.paymentStatus;
      }
    } else {
      const payment = await verifyPricingPayment(object.id);
      outcome = payment.paid ? "paid" : "unpaid";
    }
    await db.query(
      "update thrive4_admin.stripe_events set outcome=$2,processed_at=now() where event_id=$1",
      [event.id, outcome],
    );
    return { processed: true };
  });
}
