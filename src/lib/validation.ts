import { z } from "zod";
import { services } from "./data";
import { extras, frequencies } from "./config";
export const serviceSchema = z
  .string()
  .refine((v) => services.some((s) => s.slug === v), "Choose a service");
export const postcodeSchema = z
  .string()
  .regex(/^\d{4}$/, "Enter a four-digit Australian postcode");
const phone = z
  .string()
  .trim()
  .regex(/^(?:\+61|0)[\d\s()-]{8,15}$/, "Enter an Australian phone number");
export function australianDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export const bookingSchema = z.object({
  service: serviceSchema,
  property: z.enum([
    "House",
    "Apartment",
    "Townhouse",
    "Office",
    "Other commercial space",
  ]),
  bedrooms: z.coerce.number().int().min(1).max(8),
  bathrooms: z.coerce.number().int().min(1).max(6),
  frequency: z.enum(frequencies as [string, ...string[]]),
  size: z.coerce.number().min(1).max(100000).default(100),
  extras: z.array(z.string().refine((v) => extras.includes(v))).max(6),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")
    .refine((v) => v >= australianDate(), "Choose today or a future date")
    .refine((v) => {
      const d = new Date(`${v}T12:00:00Z`);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
    }, "Choose a valid date"),
  time: z.enum(["Morning (8am–12pm)", "Afternoon (12pm–5pm)", "Flexible"]),
  firstName: z.string().trim().min(2, "Enter your first name").max(80),
  lastName: z.string().trim().min(2, "Enter your last name").max(80),
  email: z.string().email("Enter a valid email").max(200),
  phone,
  address: z.string().trim().min(5, "Enter your street address").max(200),
  suburb: z.string().trim().min(2, "Enter your suburb").max(100),
  postcode: postcodeSchema,
  instructions: z.string().max(2000),
  consent: z.literal(true, {
    message: "Please agree before sending your request",
  }),
  website: z.string().max(0).optional(),
});
export const enquirySchema = z.object({
  kind: z.enum(["contact", "quote", "careers"]),
  name: z.string().trim().min(2, "Enter your name").max(150),
  email: z.string().email("Enter a valid email").max(200),
  phone,
  service: serviceSchema,
  postcode: postcodeSchema,
  message: z
    .string()
    .trim()
    .min(10, "Please include at least 10 characters")
    .max(4000),
  consent: z.literal(true, { message: "Please agree before sending" }),
  website: z.string().max(0).optional(),
});
export type BookingInput = z.input<typeof bookingSchema>;
export type Booking = z.output<typeof bookingSchema>;
