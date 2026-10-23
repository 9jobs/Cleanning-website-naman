import "server-only";
import { createHmac } from "node:crypto";
import { contactDatabase, ContactRequestError } from "./contact-database";
import { contactTransport } from "./contact-mail";
import { services } from "./data";
import type { PromoFields } from "./promo-validation";

// Public promotion configuration stays on the server. No payment discounts are applied.
export const welcomePromotion = { code: "CLEAN10", discount: 10 } as const;
export const recognisesPromo = (code: string) => code === welcomePromotion.code;
function hash(value: string) {
  return createHmac("sha256", process.env.CONTACT_RATE_LIMIT_SECRET!)
    .update(value)
    .digest("hex");
}

export async function limitPromoRequests(ip: string, verify: boolean) {
  const result = await contactDatabase().query<{ attempts: number }>(
    `insert into public.contact_request_limits as limits (client_hash) values ($1)
     on conflict (client_hash) do update set
     attempts = case when limits.window_start < now() - interval '10 minutes' then 1 else limits.attempts + 1 end,
     window_start = case when limits.window_start < now() - interval '10 minutes' then now() else limits.window_start end
     returning attempts`,
    [hash(`promo:${verify ? "verify" : "submit"}:ip:${ip}`)],
  );
  if (result.rows[0].attempts > (verify ? 30 : 5))
    throw new ContactRequestError(
      "Please wait a few minutes before trying again.",
      429,
    );
}

export async function deliverPromo(data: PromoFields) {
  // Use only namespaced, non-PII public request-limit keys. No enquiry/admin records
  // or schema changes. A transaction lock serialises identical requests across instances.
  const reference = hash(
    `promo:receipt:${JSON.stringify({ name: data.name, email: data.email.toLowerCase(), phone: data.phone.replace(/[\s()-]/g, ""), code: data.code, service: data.service, postcode: data.postcode })}`,
  );
  const client = await contactDatabase().connect();
  try {
    await client.query("begin");
    await client.query(
      "select pg_advisory_xact_lock(hashtextextended($1, 0))",
      [reference],
    );
    const existing = await client.query(
      "select 1 from public.contact_request_limits where client_hash = $1 and window_start > now() - interval '24 hours'",
      [reference],
    );
    if (!existing.rowCount) {
      const service =
        services.find((item) => item.slug === data.service)?.name ||
        "Not Provided";
      const submitted = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        dateStyle: "full",
        timeStyle: "long",
      }).format(new Date());
      const text = [
        "New Promotional Cleaning Enquiry",
        "",
        `Customer Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `Cleaning Service: ${service}`,
        `Postcode: ${data.postcode || "Not Provided"}`,
        `Promo Code: ${welcomePromotion.code}`,
        `Requested Discount: ${welcomePromotion.discount}%`,
        "Promotion: First Residential Cleaning",
        "Source: Homepage Promotional Banner",
        `Submitted At: ${submitted}`,
        "Status: Pending Eligibility Verification",
      ].join("\n");
      const result = await contactTransport().sendMail({
        from: {
          name: "Thrive4 Cleaning Website",
          address: process.env.CONTACT_SMTP_USER!,
        },
        to: process.env.CONTACT_TO_EMAIL!,
        replyTo: { name: data.name, address: data.email },
        subject: "Thrive4 Cleaning — New 10% Promo Claim",
        text,
        messageId: `<promo-${reference}@thrive4cleaning.local>`,
      });
      if (!result.accepted?.length || result.rejected?.length)
        throw new Error("Promo notification not accepted");
      await client.query(
        `insert into public.contact_request_limits (client_hash) values ($1)
        on conflict (client_hash) do update set window_start = now(), attempts = 1`,
        [reference],
      );
    }
    await client.query("commit");
    return reference;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
