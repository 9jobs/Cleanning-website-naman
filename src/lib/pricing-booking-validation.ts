import { z } from "zod";
import { promoFieldsSchema } from "./promo-validation";

export function bookingLocalNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

// Stored details remain readable after the requested appointment date passes.
export const pricingBookingDetailsSchema = z
  .object({
    name: promoFieldsSchema.shape.name,
    email: promoFieldsSchema.shape.email,
    phone: promoFieldsSchema.shape.phone,
    address: z
      .string()
      .trim()
      .min(8, "Enter your full cleaning address")
      .max(300),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")
      .refine((value) => {
        const date = new Date(`${value}T12:00:00Z`);
        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }, "Choose a valid date"),
    time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Choose a time"),
  })
  .strict();

export const pricingBookingSchema = pricingBookingDetailsSchema.refine(
  (data) => `${data.date}T${data.time}` > bookingLocalNow(),
  { message: "Choose a future date and time (Melbourne time)", path: ["date"] },
);
export const pricingBookingCheckoutSchema = z
  .object({
    service: z.enum([
      "house-cleaning",
      "one-off-cleaning",
      "property-cleaning",
    ]),
    requestId: z.string().uuid(),
    booking: pricingBookingSchema,
  })
  .strict();
export type PricingBookingDetails = z.infer<typeof pricingBookingDetailsSchema>;
