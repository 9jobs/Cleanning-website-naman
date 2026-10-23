import "server-only";
import { createHmac } from "node:crypto";
import { contactDatabase, contactDatabaseReady } from "./contact-database";
import { contactMailReady, contactTransport } from "./contact-mail";
import { InvoiceError } from "./invoices/store";
import {
  verifiedPaymentDetails,
  verifyPricingPayment,
} from "./invoices/stripe";
import { stripeAccount } from "./invoices/stripe-mode";
import type { StripeWebhookEvent } from "./invoices/webhook";

function digest(value: string) {
  return createHmac("sha256", process.env.CONTACT_RATE_LIMIT_SECRET!)
    .update(value)
    .digest("hex");
}
export function pricingBookingReady() {
  return contactDatabaseReady() && contactMailReady();
}
export async function limitPricingBookings(ip: string) {
  const result = await contactDatabase().query<{ attempts: number }>(
    `insert into public.contact_request_limits as limits (client_hash) values ($1)
     on conflict (client_hash) do update set
     attempts = case when limits.window_start < now() - interval '10 minutes' then 1 else limits.attempts + 1 end,
     window_start = case when limits.window_start < now() - interval '10 minutes' then now() else limits.window_start end
     returning attempts`,
    [digest(`pricing-booking:ip:${ip}`)],
  );
  if (result.rows[0].attempts > 10)
    throw new InvoiceError(
      "Please wait a few minutes before trying again.",
      429,
    );
}

export async function notifyPaidPricingBooking(sessionId: string) {
  const payment = await verifyPricingPayment(sessionId);
  if (!payment.booking) return "legacy";
  if (!payment.paid || !payment.paymentIntentId) return "unpaid";
  // Independently verify the succeeded PaymentIntent and exact paid amount.
  await verifiedPaymentDetails(payment.paymentIntentId, {
    app: "thrive4-pricing-checkout",
    service: payment.serviceSlug,
    amount: payment.amount,
    live: payment.live,
  });
  if (!pricingBookingReady())
    throw new Error("Booking notifications unavailable");
  const reference = digest(`pricing-booking:paid:${payment.sessionId}`);
  const db = await contactDatabase().connect();
  try {
    await db.query("begin");
    await db.query("select pg_advisory_xact_lock(hashtextextended($1, 0))", [
      reference,
    ]);
    const existing = await db.query(
      "select 1 from public.contact_request_limits where client_hash = $1",
      [reference],
    );
    if (existing.rowCount) {
      await db.query("commit");
      return "duplicate";
    }
    const details = payment.booking;
    const result = await contactTransport().sendMail({
      from: {
        name: "Thrive4 Cleaning Bookings",
        address: process.env.CONTACT_SMTP_USER!,
      },
      to: process.env.CONTACT_TO_EMAIL!,
      replyTo: { name: details.name, address: details.email },
      subject: `Thrive4 Cleaning — Paid Booking — ${payment.service}`,
      text: [
        "NEW PAID THRIVE4 CLEANING BOOKING",
        "",
        `Service: ${payment.service}`,
        `Name: ${details.name}`,
        `Email: ${details.email}`,
        `Phone: ${details.phone}`,
        `Cleaning address: ${details.address}`,
        `Requested date: ${details.date}`,
        `Requested time: ${details.time} (Australia/Melbourne)`,
        "",
        `Payment status: Paid${payment.live ? "" : " (Stripe test mode)"}`,
        `Amount paid: AUD ${payment.amount.toFixed(2)}`,
        `Checkout reference: ${payment.sessionId}`,
        `Payment reference: ${payment.paymentIntentId}`,
        `Received: ${new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", dateStyle: "full", timeStyle: "long" }).format(new Date())}`,
        "",
        "Please contact the customer to confirm their requested appointment time.",
      ].join("\n"),
      messageId: `<pricing-booking-${reference}@thrive4cleaning.local>`,
    });
    if (!result.accepted?.length || result.rejected?.length)
      throw new Error("Booking notification was not accepted");
    await db.query(
      "insert into public.contact_request_limits (client_hash) values ($1) on conflict do nothing",
      [reference],
    );
    await db.query("commit");
    return "sent";
  } catch (error) {
    await db.query("rollback").catch(() => {});
    throw error;
  } finally {
    db.release();
  }
}

// Called only after the existing route authenticates Stripe's raw-body signature.
export async function processPricingBookingEvent(event: StripeWebhookEvent) {
  if (event.data.object.metadata?.app !== "thrive4-pricing-checkout")
    return { ignored: true };
  if (
    (event.account && event.account !== stripeAccount(event.livemode)) ||
    !event.data.object.id.startsWith(event.livemode ? "cs_live_" : "cs_test_")
  )
    throw new InvoiceError("Wrong booking payment account or mode.", 400);
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event.type)
  )
    return { ignored: true };
  const outcome = await notifyPaidPricingBooking(event.data.object.id);
  return { processed: true, outcome };
}
