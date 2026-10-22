import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  localAdminAllowed,
  privateHeaders,
  requestOrigin,
} from "@/lib/invoices/access";
import { InvoiceError } from "@/lib/invoices/store";
import { createPricingCheckout } from "@/lib/invoices/stripe";
import { pricingServices } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const schema = z
  .object({ service: z.enum(pricingServices), requestId: z.string().uuid() })
  .strict();
export async function POST(request: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status, headers: privateHeaders });
  if (!localAdminAllowed(request)) return json({ error: "Not found." }, 404);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Send JSON." }, 415);
  try {
    const text = await request.text();
    if (text.length > 1024) return json({ error: "Request too large." }, 413);
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return json(
        { error: "Choose a supported service and retry checkout." },
        400,
      );
    return json(
      await createPricingCheckout(
        parsed.data.service,
        parsed.data.requestId,
        requestOrigin(request),
      ),
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof InvoiceError
            ? error.message
            : "Could not open Stripe test checkout. Please retry.",
      },
      error instanceof InvoiceError ? error.status : 502,
    );
  }
}
