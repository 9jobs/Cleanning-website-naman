import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { Resend } from "resend";
import { bookingSchema, enquirySchema } from "@/lib/validation";
import { database, submissionsReady } from "@/lib/server";
export const runtime = "nodejs";
const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    const parsedOrigin = new URL(origin || "");
    sameOrigin =
      ["http:", "https:"].includes(parsedOrigin.protocol) &&
      parsedOrigin.host === request.headers.get("host");
  } catch {}
  if (!sameOrigin) return fail("This request must come from the website.", 403);
  if (Number(request.headers.get("content-length") || 0) > 6 * 1024 * 1024)
    return fail("This request is too large.", 413);
  let payload: unknown;
  let file: File | null = null;
  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > 6 * 1024 * 1024)
      return fail("This request is too large.", 413);
    const bounded = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: bytes,
    });
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await bounded.formData();
      payload = JSON.parse(String(form.get("data")));
      const upload = form.get("resume");
      if (upload instanceof File && upload.size) file = upload;
    } else payload = await bounded.json();
  } catch {
    return fail("Please send valid form data.");
  }
  if (typeof payload !== "object" || payload === null)
    return fail("Invalid request.");
  const kind = "kind" in payload ? payload.kind : undefined;
  const parsed =
    kind === "booking"
      ? bookingSchema.safeParse(payload)
      : enquirySchema.safeParse(payload);
  if (!parsed.success)
    return fail(
      parsed.error.issues[0]?.message || "Please check your details.",
    );
  if (file && kind !== "careers")
    return fail("Files are only accepted with applications.");
  let resumeBytes: ArrayBuffer | null = null;
  if (file) {
    if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024)
      return fail("Please upload a PDF under 5 MB.");
    resumeBytes = await file.arrayBuffer();
    if (Buffer.from(resumeBytes).subarray(0, 5).toString() !== "%PDF-")
      return fail("The résumé must be a valid PDF.");
  }
  if (!submissionsReady())
    return fail(
      "Online submissions are not connected yet. Your request has not been received. Please return once Thrive4 Cleaning’s contact and booking service is available.",
      503,
    );
  const db = database()!;
  // Durable, atomic database limiter; requires the supplied migration. Configure your reverse proxy
  // to overwrite x-forwarded-for with the actual client IP before enabling live submissions.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const fingerprint = createHmac(
    "sha256",
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
    .update(ip)
    .digest("hex");
  const { data: allowed, error: limitError } = await db.rpc(
    "allow_submission",
    { client_hash: fingerprint },
  );
  if (limitError)
    return fail(
      "The enquiry service is temporarily unavailable. Your request was not received.",
      503,
    );
  if (!allowed)
    return fail(
      "Too many requests. Please wait 15 minutes and try again.",
      429,
    );
  const id = randomUUID();
  let resumePath: string | null = null;
  if (file && resumeBytes) {
    resumePath = `${id}/resume.pdf`;
    const { error } = await db.storage
      .from("resumes")
      .upload(resumePath, resumeBytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (error)
      return fail(
        "Your résumé could not be stored. Your application has not been received.",
        503,
      );
  }
  const { website: discarded, ...clean } = parsed.data;
  void discarded;
  const { error } = await db.from("submissions").insert({
    id,
    kind,
    payload: clean,
    resume_path: resumePath,
    status: "new",
    notification_status: "pending",
  });
  if (error) {
    if (resumePath) await db.storage.from("resumes").remove([resumePath]);
    return fail("Your request could not be stored. Please try again.", 503);
  }
  let notified = false;
  if (
    process.env.RESEND_API_KEY &&
    process.env.NOTIFICATION_FROM &&
    process.env.NOTIFICATION_TO
  ) {
    try {
      const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: process.env.NOTIFICATION_FROM,
        to: process.env.NOTIFICATION_TO,
        subject: `New Thrive4 Cleaning ${kind} request ${id}`,
        text: `A new ${kind} request has been stored securely. Reference: ${id}. Review it in the authorised Supabase dashboard. No customer details are included in this email.`,
      });
      notified = !result.error;
    } catch {
      notified = false;
    }
  }
  await db
    .from("submissions")
    .update({ notification_status: notified ? "sent" : "pending" })
    .eq("id", id);
  return NextResponse.json(
    {
      reference: id,
      status: "received",
      notificationStatus: notified ? "sent" : "pending",
    },
    { status: 201 },
  );
}
