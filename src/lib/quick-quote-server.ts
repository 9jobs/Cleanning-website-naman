import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { contactDatabase, ContactRequestError } from "./contact-database";
import { contactTransport } from "./contact-mail";
import type { QuickQuoteRequest } from "./quick-quote-validation";

export async function saveQuickQuote(
  data: QuickQuoteRequest,
  digest: string,
  ip: string,
) {
  const client = await contactDatabase().connect();
  try {
    await client.query("begin");
    await client.query(
      "select pg_advisory_xact_lock(hashtextextended($1, 0))",
      [data.submissionId],
    );
    const existing = await client.query<{
      request_digest: string;
      notification_status: string;
      active: boolean;
    }>(
      `select request_digest, notification_status, notification_lease_until > now() as active
        from public.quick_quote_enquiries where id = $1`,
      [data.submissionId],
    );
    const row = existing.rows[0];
    if (row && row.request_digest !== digest)
      throw new ContactRequestError(
        "This reference belongs to another request. Please reload and try again.",
        409,
      );
    if (row?.notification_status === "sent") {
      await client.query("commit");
      return { reference: data.submissionId, sent: true, claim: "" };
    }
    if (row?.notification_status === "sending" && row.active)
      throw new ContactRequestError(
        "Your request is already being processed. Please wait a moment before retrying.",
        409,
      );
    const hash = createHmac("sha256", process.env.CONTACT_RATE_LIMIT_SECRET!)
      .update(ip)
      .digest("hex");
    const limit = await client.query<{ attempts: number }>(
      `
      insert into public.contact_request_limits as limits (client_hash) values ($1)
      on conflict (client_hash) do update set
      attempts = case when limits.window_start < now() - interval '10 minutes' then 1 else limits.attempts + 1 end,
      window_start = case when limits.window_start < now() - interval '10 minutes' then now() else limits.window_start end
      returning attempts`,
      [hash],
    );
    if (limit.rows[0].attempts > 5) {
      await client.query("commit");
      throw new ContactRequestError(
        "Please wait a few minutes before sending another enquiry.",
        429,
      );
    }
    if (!row)
      await client.query(
        `insert into public.quick_quote_enquiries
        (id, request_digest, name, email, phone, consent) values ($1,$2,$3,$4,$5,$6)`,
        [
          data.submissionId,
          digest,
          data.name,
          data.email,
          data.phone,
          data.consent,
        ],
      );
    const claim = randomUUID();
    await client.query(
      `update public.quick_quote_enquiries set notification_status = 'sending',
      notification_claim = $2, notification_lease_until = now() + interval '2 minutes',
      notification_attempts = notification_attempts + 1, updated_at = now() where id = $1`,
      [data.submissionId, claim],
    );
    // Email is sent only after this durable transaction succeeds.
    await client.query("commit");
    return { reference: data.submissionId, sent: false, claim };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function markQuickQuoteNotification(
  reference: string,
  claim: string,
  messageId: string | null,
) {
  await contactDatabase().query(
    `update public.quick_quote_enquiries set
    notification_status = $3, email_message_id = $4,
    email_sent_at = case when $3 = 'sent' then now() else null end,
    notification_lease_until = null, notification_claim = null, updated_at = now()
    where id = $1 and notification_claim = $2`,
    [reference, claim, messageId ? "sent" : "failed", messageId],
  );
}

export async function sendQuickQuoteMail(
  data: QuickQuoteRequest,
  reference: string,
) {
  const result = await contactTransport().sendMail({
    from: {
      name: "Thrive4 Cleaning Website",
      address: process.env.CONTACT_SMTP_USER!,
    },
    to: process.env.CONTACT_TO_EMAIL!,
    replyTo: { name: data.name.replace(/[\r\n]/g, " "), address: data.email },
    subject: `New quick cleaning quote — ${data.name.replace(/[\r\n]/g, " ")}`,
    text: [
      "NEW THRIVE4 CLEANING HOMEPAGE QUOTE REQUEST",
      `Reference: ${reference}`,
      `Received: ${new Date().toISOString()}`,
      "",
      `First name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      "",
      "Source: homepage quick quote form.",
      "The customer requested a quote and agreed to be contacted about this enquiry.",
      "Please contact the customer to discuss their service, property and scheduling requirements.",
      "No service, price or appointment has been confirmed.",
      "Reply to this email to contact the customer directly.",
    ].join("\n"),
    messageId: `<quick-${reference}@thrive4cleaning.local>`,
    headers: { "X-Thrive4-Reference": reference },
  });
  if (!result.accepted?.length || result.rejected?.length)
    throw new Error("The mail server did not accept the quick quote");
  return result.messageId;
}
