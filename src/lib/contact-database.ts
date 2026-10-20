import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import type { ContactRequest } from "./contact-validation";

const state = globalThis as typeof globalThis & { contactPool?: Pool };
export function contactDatabaseReady() {
  return Boolean(
    process.env.CONTACT_DATABASE_URL && process.env.CONTACT_RATE_LIMIT_SECRET,
  );
}
function database() {
  if (!contactDatabaseReady()) throw new Error("Contact database unavailable");
  if (!state.contactPool) {
    state.contactPool = new Pool({
      connectionString: process.env.CONTACT_DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
        ca: readFileSync(
          path.join(process.cwd(), "certificates/supabase-root.crt"),
          "utf8",
        ),
      },
      max: 2,
      connectionTimeoutMillis: 12000,
      idleTimeoutMillis: 10000,
      query_timeout: 12000,
      application_name: "thrive4-contact",
    });
    state.contactPool.on("error", () =>
      console.error("Contact database idle connection closed"),
    );
  }
  return state.contactPool;
}
export class ContactRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Save and commit the enquiry BEFORE sending email. The lock, unique ID and lease
// also work across separate Vercel function instances, not just one Node process.
export async function saveContactEnquiry(
  data: ContactRequest,
  digest: string,
  ip: string,
) {
  const client = await database().connect();
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
      `select request_digest, notification_status,
      notification_lease_until > now() as active
      from public.contact_enquiries where id = $1`,
      [data.submissionId],
    );
    const row = existing.rows[0];
    if (row && row.request_digest !== digest)
      throw new ContactRequestError(
        "This enquiry reference already exists with different details. Please reload to start a new enquiry.",
        409,
      );
    if (row?.notification_status === "sent") {
      await client.query("commit");
      return { reference: data.submissionId, sent: true, claim: "" };
    }
    if (row?.notification_status === "sending" && row.active)
      throw new ContactRequestError(
        "Your enquiry is already being processed. Please wait a moment before trying again.",
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
        `
      insert into public.contact_enquiries
      (id, request_digest, name, email, phone, service, property_type, location,
       bedrooms, bathrooms, frequency, floor_area, preferred_date, message, consent)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          data.submissionId,
          digest,
          data.name,
          data.email,
          data.phone,
          data.service,
          data.property,
          data.location,
          data.bedrooms,
          data.bathrooms,
          data.frequency,
          data.size ?? null,
          data.date || null,
          data.message,
          data.consent,
        ],
      );
    const claim = randomUUID();
    await client.query(
      `update public.contact_enquiries set
      notification_status = 'sending', notification_claim = $2,
      notification_lease_until = now() + interval '2 minutes',
      notification_attempts = notification_attempts + 1, updated_at = now()
      where id = $1`,
      [data.submissionId, claim],
    );
    await client.query("commit");
    return { reference: data.submissionId, sent: false, claim };
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function markContactNotification(
  reference: string,
  claim: string,
  messageId: string | null,
) {
  await database().query(
    `update public.contact_enquiries set
    notification_status = $3, email_message_id = $4,
    email_sent_at = case when $3 = 'sent' then now() else null end,
    notification_lease_until = null, notification_claim = null, updated_at = now()
    where id = $1 and notification_claim = $2`,
    [reference, claim, messageId ? "sent" : "failed", messageId],
  );
}
