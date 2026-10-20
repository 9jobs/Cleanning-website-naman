import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { contactRequestSchema } from "@/lib/contact-validation";
import { contactMailReady, sendContactMail } from "@/lib/contact-mail";
import {
  contactDatabaseReady,
  ContactRequestError,
  saveContactEnquiry,
  markContactNotification,
} from "@/lib/contact-database";

export const runtime = "nodejs";
export const maxDuration = 60;
const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    if (
      origin.host !== request.headers.get("host") ||
      !["http:", "https:"].includes(origin.protocol)
    )
      return fail("Please send your enquiry from this website.", 403);
  } catch {
    return fail("Please send your enquiry from this website.", 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return fail("Send a valid enquiry.", 415);
  if (Number(request.headers.get("content-length") || 0) > 16384)
    return fail("Your enquiry is too long.", 413);
  let payload: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail("Please complete the form.", 400);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 16384) {
        await reader.cancel();
        return fail("Your enquiry is too long.", 413);
      }
      chunks.push(value);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return fail("Please send a valid enquiry.", 400);
  }
  const parsed = contactRequestSchema.safeParse(payload);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (!contactMailReady() || !contactDatabaseReady())
    return fail(
      "Email enquiries are temporarily unavailable. Please email Thrive4cleaning@gmail.com directly.",
      503,
    );
  const data = parsed.data;
  const digest = createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
  let saved: Awaited<ReturnType<typeof saveContactEnquiry>>;
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    saved = await saveContactEnquiry(data, digest, ip);
  } catch (error) {
    if (error instanceof ContactRequestError)
      return fail(error.message, error.status);
    console.error("Contact database save failed");
    return fail(
      "We couldn’t save your enquiry. Please try again, or email Thrive4cleaning@gmail.com directly. Your appointment has not been booked.",
      503,
    );
  }
  if (saved.sent) return NextResponse.json({ reference: saved.reference });
  let messageId: string;
  try {
    const result = await sendContactMail(data, saved.reference);
    messageId = result.messageId;
  } catch {
    await markContactNotification(saved.reference, saved.claim, null).catch(
      () =>
        console.error(
          "Contact notification failure status could not be recorded",
        ),
    );
    return fail(
      "Your enquiry is saved safely, but the notification email could not be sent. Please retry with the same details, or email Thrive4cleaning@gmail.com directly. Your appointment has not been booked.",
      502,
    );
  }
  try {
    await markContactNotification(saved.reference, saved.claim, messageId);
  } catch {
    // SMTP already accepted the email. Do not tell the customer to resubmit.
    console.error(
      "Contact email accepted; delivery status reconciliation required",
      saved.reference,
    );
  }
  return NextResponse.json({ reference: saved.reference });
}
