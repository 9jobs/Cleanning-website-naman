import { z } from "zod";
import { enquirySchema } from "./validation";

export const quickQuoteFieldsSchema = z.object({
  name: z.string().trim().min(2, "Enter your first name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: enquirySchema.shape.phone,
  consent: z.literal(true, { message: "Please agree to be contacted" }),
  website: z.string().max(0).default(""),
});

export const quickQuoteRequestSchema = quickQuoteFieldsSchema.extend({
  submissionId: z.string().uuid(),
});
export type QuickQuoteRequest = z.output<typeof quickQuoteRequestSchema>;
