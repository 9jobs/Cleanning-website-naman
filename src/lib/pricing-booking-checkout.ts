import { createHmac } from "node:crypto";
import type { Pool } from "pg";
import type { PricingBookingDetails } from "./pricing-booking-validation";
import { InvoiceError } from "./invoices/store";
import { createPricingCheckout, verifyPricingPayment } from "./invoices/stripe";
import { stripeLiveMode } from "./invoices/stripe-mode";

export function pricingBookingIdentity(email: string, live: boolean) {
  return createHmac("sha256", process.env.CONTACT_RATE_LIMIT_SECRET!)
    .update(`pricing-booking:customer:${live}:${email.trim().toLowerCase()}`)
    .digest("hex");
}

// All three plans share one email lock across tabs, devices and server instances.
// Keep only hashed identity and the Stripe reference in the existing private store.
export async function createUniquePricingCheckout(
  pool: Pool,
  service: string,
  requestId: string,
  origin: string,
  booking: PricingBookingDetails,
) {
  const details = { ...booking, email: booking.email.trim().toLowerCase() };
  const identity = pricingBookingIdentity(details.email, stripeLiveMode());
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(
      "select pg_advisory_xact_lock(hashtextextended($1, 0))",
      [identity],
    );
    const existing = await client.query<{ client_hash: string }>(
      "select client_hash from public.contact_request_limits where client_hash = $1 or client_hash like $2",
      [identity, `${identity}:%`],
    );
    if (existing.rows.some((row) => row.client_hash === identity))
      throw new InvoiceError(
        "A booking already exists for this email address. You cannot book another cleaning plan.",
        409,
      );

    let expiredSession = "";
    for (const row of existing.rows) {
      const sessionId = row.client_hash.slice(identity.length + 1);
      const payment = await verifyPricingPayment(sessionId);
      if (payment.status === "complete" || payment.paid)
        throw new InvoiceError(
          "A booking already exists for this email address. You cannot book another cleaning plan.",
          409,
        );
      if (payment.status === "open") {
        if (
          payment.serviceSlug === service &&
          payment.url &&
          new URL(payment.url).origin === "https://checkout.stripe.com" &&
          payment.booking &&
          Object.entries(details).every(
            ([key, value]) =>
              payment.booking![key as keyof PricingBookingDetails] === value,
          )
        ) {
          await client.query("commit");
          return { url: payment.url, sessionId };
        }
        throw new InvoiceError(
          "A checkout is already in progress for this email address. Complete the original booking or wait for that checkout to expire before choosing another plan.",
          409,
        );
      }
      // Unpaid expired checkouts are not bookings and may safely be replaced.
      expiredSession = sessionId;
      await client.query(
        "delete from public.contact_request_limits where client_hash = $1",
        [row.client_hash],
      );
    }
    const checkout = await createPricingCheckout(
      service,
      `${identity}-${requestId}-${expiredSession}`,
      origin,
      details,
    );
    await client.query(
      "insert into public.contact_request_limits (client_hash) values ($1)",
      [`${identity}:${checkout.sessionId}`],
    );
    await client.query("commit");
    return checkout;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
