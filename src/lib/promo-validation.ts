import { z } from "zod";
import { publicServices as services } from "./data";
import { postcodeSchema } from "./validation";

// Match the services currently offered in the website navigation.
export const promoServices = services.filter((service) =>
  [
    "house-cleaning",
    "one-off-cleaning",
    "apartment-cleaning",
    "property-cleaning",
    "airbnb-cleaning",
  ].includes(service.slug),
);

export const promoCodeSchema = z
  .string()
  .trim()
  .min(1, "Enter promo code")
  .max(40)
  .transform((value) => value.toUpperCase());
export const promoFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(150)
    .refine((value) => !/[\r\n]/.test(value), "Enter your name on one line"),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(32)
    .refine((value) => {
      if (!/^[+\d\s()-]+$/.test(value)) return false;
      const compact = value.replace(/[\s()-]/g, "");
      return (
        /^0[2-478]\d{8}$/.test(compact) ||
        /^\+61[2-478]\d{8}$/.test(compact) ||
        /^\+(?!61)[1-9]\d{7,14}$/.test(compact)
      );
    }, "Enter a valid Australian or international phone number"),
  code: promoCodeSchema,
  service: z
    .string()
    .default("")
    .refine(
      (value) =>
        !value || promoServices.some((service) => service.slug === value),
      "Choose a residential service",
    ),
  postcode: z.union([z.literal(""), postcodeSchema]).default(""),
  website: z.string().max(0).default(""),
});
export type PromoFields = z.output<typeof promoFieldsSchema>;
