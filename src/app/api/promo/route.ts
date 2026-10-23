import { NextRequest, NextResponse } from "next/server";
import {
  contactDatabaseReady,
  ContactRequestError,
} from "@/lib/contact-database";
import { contactMailReady } from "@/lib/contact-mail";
import { promoCodeSchema, promoFieldsSchema } from "@/lib/promo-validation";
import {
  deliverPromo,
  limitPromoRequests,
  recognisesPromo,
} from "@/lib/promo-server";

export const runtime = "nodejs";
export const maxDuration = 60;
const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: NextRequest) {
  try {
    const origin = new URL(request.headers.get("origin") || "");
    if (
      origin.host !== request.headers.get("host") ||
      !["http:", "https:"].includes(origin.protocol)
    )
      return reply(
        { error: "Please use the offer form on this website." },
        403,
      );
  } catch {
    return reply({ error: "Please use the offer form on this website." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return reply({ error: "Send valid form details." }, 415);
  let payload;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Please complete the form." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) {
        await reader.cancel();
        return reply({ error: "Your request is too long." }, 413);
      }
      chunks.push(value);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return reply({ error: "Send valid form details." }, 400);
  }
  const verify = payload?.action === "verify";
  const parsed = verify
    ? promoCodeSchema.safeParse(payload?.code)
    : promoFieldsSchema.safeParse(payload);
  if (!parsed.success)
    return reply(
      {
        error: "Please check your details.",
        fields: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  if (!contactDatabaseReady())
    return reply(
      {
        error:
          "Offer requests are temporarily unavailable. Please try again later.",
      },
      503,
    );
  try {
    await limitPromoRequests(
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local",
      verify,
    );
    const code = verify
      ? (parsed.data as string)
      : (parsed.data as { code: string }).code;
    if (!recognisesPromo(code))
      return reply(
        {
          error: "That promo code isn't valid. Please check it and try again.",
        },
        400,
      );
    if (verify) return reply({ recognised: true });
    if (!contactMailReady())
      return reply(
        {
          error:
            "Offer requests are temporarily unavailable. Please try again later.",
        },
        503,
      );
    await deliverPromo(promoFieldsSchema.parse(payload));
    return reply({ accepted: true });
  } catch (error) {
    if (error instanceof ContactRequestError)
      return reply({ error: error.message }, error.status);
    console.error("Promo enquiry could not be delivered");
    return reply(
      {
        error:
          "We couldn't confirm your enquiry was received. Please try again or contact us directly.",
      },
      502,
    );
  }
}
