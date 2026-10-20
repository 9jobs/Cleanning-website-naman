import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { contactRequestSchema } from "@/lib/contact-validation";
import { contactMailReady, sendContactMail } from "@/lib/contact-mail";

export const runtime = "nodejs";
type Receipt = { digest: string; reference: string; expires: number };
type Attempt = { count: number; expires: number };
const cache = globalThis as typeof globalThis & {
  thriveContactReceipts?: Map<string, Receipt>;
  thriveContactAttempts?: Map<string, Attempt>;
  thriveContactPending?: Map<string, { digest: string; task: Promise<string> }>;
};
const receipts = (cache.thriveContactReceipts ??= new Map());
const attempts = (cache.thriveContactAttempts ??= new Map());
const pending = (cache.thriveContactPending ??= new Map());
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
  if (!contactMailReady())
    return fail(
      "Email enquiries are temporarily unavailable. Please email Thrive4cleaning@gmail.com directly.",
      503,
    );
  const data = parsed.data;
  const now = Date.now();
  for (const [key, value] of receipts)
    if (value.expires < now) receipts.delete(key);
  for (const [key, value] of attempts)
    if (value.expires < now) attempts.delete(key);
  const digest = createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
  const receipt = receipts.get(data.submissionId);
  if (receipt)
    return receipt.digest === digest
      ? NextResponse.json({ reference: receipt.reference })
      : fail("Please start a new enquiry.", 409);
  const inFlight = pending.get(data.submissionId);
  if (inFlight && inFlight.digest !== digest)
    return fail("Please wait for the current enquiry to finish.", 409);
  if (!inFlight) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = createHash("sha256").update(ip).digest("hex");
    const attempt = attempts.get(key) || {
      count: 0,
      expires: now + 10 * 60 * 1000,
    };
    if (attempt.count >= 5 || receipts.size > 5000 || attempts.size > 5000)
      return fail(
        "Please wait a few minutes before sending another enquiry.",
        429,
      );
    attempt.count += 1;
    attempts.set(key, attempt);
    const task = (async () => {
      const reference = randomUUID();
      await sendContactMail(data, reference);
      receipts.set(data.submissionId, {
        reference,
        digest,
        expires: Date.now() + 30 * 60 * 1000,
      });
      return reference;
    })();
    pending.set(data.submissionId, { digest, task });
  }
  try {
    const reference = await pending.get(data.submissionId)!.task;
    return NextResponse.json({ reference });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "MAIL_NOT_ACCEPTED";
    console.error("Contact enquiry email was not accepted:", code);
    return fail(
      "We couldn’t send your enquiry. Please try again, or email Thrive4cleaning@gmail.com directly. Your appointment has not been booked.",
      502,
    );
  } finally {
    pending.delete(data.submissionId);
  }
}
