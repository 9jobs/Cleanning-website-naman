import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  contactDatabaseReady,
  ContactRequestError,
} from "@/lib/contact-database";
import { contactMailReady } from "@/lib/contact-mail";
import { quickQuoteRequestSchema } from "@/lib/quick-quote-validation";
import {
  markQuickQuoteNotification,
  saveQuickQuote,
  sendQuickQuoteMail,
} from "@/lib/quick-quote-server";

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
      return fail("Please send your quote request from this website.", 403);
  } catch {
    return fail("Please send your quote request from this website.", 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return fail("Send a valid quote request.", 415);
  if (Number(request.headers.get("content-length") || 0) > 4096)
    return fail("Your request is too long.", 413);
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
      if (length > 4096) {
        await reader.cancel();
        return fail("Your request is too long.", 413);
      }
      chunks.push(value);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return fail("Please send valid form details.", 400);
  }
  const parsed = quickQuoteRequestSchema.safeParse(payload);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Please check your details.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (!contactDatabaseReady() || !contactMailReady())
    return fail(
      "Quote requests are temporarily unavailable. Please email Thrive4cleaning@gmail.com directly.",
      503,
    );
  const data = parsed.data;
  const digest = createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
  let saved: Awaited<ReturnType<typeof saveQuickQuote>>;
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    saved = await saveQuickQuote(data, digest, ip);
  } catch (error) {
    if (error instanceof ContactRequestError)
      return fail(error.message, error.status);
    console.error("Quick quote database save failed");
    return fail(
      "We couldn’t save your request. Please try again or email Thrive4cleaning@gmail.com.",
      503,
    );
  }
  if (saved.sent) return NextResponse.json({ reference: saved.reference });
  let messageId: string;
  try {
    messageId = await sendQuickQuoteMail(data, saved.reference);
  } catch {
    await markQuickQuoteNotification(saved.reference, saved.claim, null).catch(
      () =>
        console.error("Quick quote email failure status could not be recorded"),
    );
    return fail(
      "Your request is saved, but the email notification could not be sent. Please retry with the same details, or email Thrive4cleaning@gmail.com.",
      502,
    );
  }
  try {
    await markQuickQuoteNotification(saved.reference, saved.claim, messageId);
  } catch {
    console.error(
      "Quick quote email accepted; notification status reconciliation required",
      saved.reference,
    );
  }
  return NextResponse.json({ reference: saved.reference });
}
