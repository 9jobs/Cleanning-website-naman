import { z } from "zod";
import { bookingSchema, enquirySchema, serviceSchema } from "./validation";

export const contactFieldsSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(150),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: enquirySchema.shape.phone,
  service: serviceSchema,
  property: bookingSchema.shape.property,
  location: z
    .string()
    .trim()
    .min(2, "Enter your suburb or postcode")
    .max(120)
    .refine(
      (value) => !/^\d+$/.test(value) || /^\d{4}$/.test(value),
      "Enter a four-digit Australian postcode or your suburb name",
    ),
  bedrooms: z.coerce.number().int().min(1).max(8),
  bathrooms: z.coerce.number().int().min(1).max(6),
  frequency: bookingSchema.shape.frequency,
  size: z.coerce.number().min(1).max(100000).optional(),
  date: z.union([z.literal(""), bookingSchema.shape.date]),
  message: z.string().trim().max(4000),
  consent: z.literal(true, {
    message: "Please agree before sending your enquiry",
  }),
  website: z.string().max(0).optional(),
});
export const contactRequestSchema = contactFieldsSchema.extend({
  submissionId: z.string().uuid(),
});
export type ContactFields = z.input<typeof contactFieldsSchema>;
export type ContactRequest = z.output<typeof contactRequestSchema>;
