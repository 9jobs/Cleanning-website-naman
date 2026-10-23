import { NextRequest, NextResponse } from "next/server";
import {
  localAdminAllowed,
  privateHeaders,
  requestOrigin,
} from "@/lib/invoices/access";
import { InvoiceError } from "@/lib/invoices/store";
import { createPricingCheckout } from "@/lib/invoices/stripe";
import { pricingBookingCheckoutSchema } from "@/lib/pricing-booking-validation";
import {
  limitPricingBookings,
  pricingBookingReady,
} from "@/lib/pricing-booking-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status, headers: privateHeaders });
  if (!localAdminAllowed(request)) return json({ error: "Not found." }, 404);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Send JSON." }, 415);
  try {
    const text = await request.text();
    if (text.length > 4096) return json({ error: "Request too large." }, 413);
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: "Send valid JSON." }, 400);
    }
    const parsed = pricingBookingCheckoutSchema.safeParse(body);
    if (!parsed.success)
      return json(
        {
          error:
            "Complete all booking details and choose a future date and time.",
          fields: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    if (!pricingBookingReady())
      return json(
        {
          error:
            "Booking is temporarily unavailable. Please try again shortly.",
        },
        503,
      );
    await limitPricingBookings(
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local",
    );
    return json(
      await createPricingCheckout(
        parsed.data.service,
        parsed.data.requestId,
        requestOrigin(request),
        parsed.data.booking,
      ),
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof InvoiceError
            ? error.message
            : "Could not open Stripe checkout. Please retry.",
      },
      error instanceof InvoiceError ? error.status : 502,
    );
  }
}
