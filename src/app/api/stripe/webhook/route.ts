import { NextRequest } from "next/server";
import { productionHostAllowed, privateHeaders } from "@/lib/invoices/access";
import {
  processStripeWebhook,
  verifyWebhookSignature,
} from "@/lib/invoices/webhook";
import { InvoiceError } from "@/lib/invoices/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (
    !productionHostAllowed(host) &&
    !(
      process.env.NODE_ENV === "development" &&
      /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    )
  )
    return new Response("Not found", { status: 404 });
  const secret = process.env.THRIVE4_STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith("whsec_"))
    return Response.json(
      { error: "Webhook not configured." },
      { status: 503, headers: privateHeaders },
    );
  const signature = request.headers.get("stripe-signature") || "";
  if (!signature || signature.length > 4096)
    return Response.json(
      { error: "Invalid webhook signature." },
      { status: 400, headers: privateHeaders },
    );
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new InvoiceError("Missing webhook body.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 262144) {
        await reader.cancel();
        throw new InvoiceError("Webhook too large.", 413);
      }
      chunks.push(value);
    }
    const event = verifyWebhookSignature(
      Buffer.concat(chunks),
      signature,
      secret,
    );
    const result = await processStripeWebhook(event);
    return Response.json(
      { received: true, ...result },
      { headers: privateHeaders },
    );
  } catch (error) {
    const status =
      error instanceof InvoiceError && error.status < 500 ? error.status : 503;
    return Response.json(
      {
        error:
          status < 500
            ? "Invalid webhook request."
            : "Webhook processing unavailable. Please retry.",
      },
      { status, headers: privateHeaders },
    );
  }
}
