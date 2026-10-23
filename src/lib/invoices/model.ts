import { z } from "zod";
import { services } from "../data";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Choose a valid date.");
const line = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !/[\r\n\x00]/.test(value), "Use a single line.");
const billingNumber = (max: number) =>
  z
    .number()
    .finite()
    .positive()
    .max(max)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
      "Use up to two decimal places.",
    );
export function calculateInvoiceAmount(hours: number, hourlyRate: number) {
  return (
    Math.round((Math.round(hours * 100) * Math.round(hourlyRate * 100)) / 100) /
    100
  );
}
export const invoiceSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1)
      .max(40)
      .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and hyphens."),
    invoiceDate: date,
    issuedDate: date,
    dueDate: date,
    validUntil: date,
    name: line(120),
    email: z.string().trim().email().max(254),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[+\d ()-]*$/, "Enter a valid phone number."),
    address: z.string().trim().max(400),
    service: z
      .string()
      .refine(
        (value) => services.some((service) => service.slug === value),
        "Choose a cleaning service.",
      ),
    plan: z.enum(["Weekly", "Fortnightly", "One-off", "Onboarding fees"]),
    autopay: z.boolean(),
    description: line(300),
    numberOfPeople: z.number().int().min(1).max(1000).optional(),
    hours: billingNumber(10000),
    hourlyRate: billingNumber(100000),
    amount: z
      .number()
      .finite()
      .positive()
      .max(100000)
      .refine(
        (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
        "Use up to two decimal places.",
      ),
    notes: z.string().trim().max(2000),
  })
  .superRefine((value, ctx) => {
    const total = calculateInvoiceAmount(value.hours, value.hourlyRate);
    if (
      total <= 0 ||
      total > 100000 ||
      Math.abs(value.amount - total) > 0.000001
    )
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message:
          "Total must equal hours worked × hourly rate and be between AUD 0.01 and AUD 100,000.",
      });
    for (const field of ["dueDate", "validUntil"] as const) {
      if (value[field] < value.issuedDate)
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Must be on or after the issued date.",
        });
    }
    if (value.autopay && !["Weekly", "Fortnightly"].includes(value.plan))
      ctx.addIssue({
        code: "custom",
        path: ["autopay"],
        message: "Autopay preference is for recurring plans only.",
      });
  })
  .transform((value) => ({
    ...value,
    amount: calculateInvoiceAmount(value.hours, value.hourlyRate),
  }));
export type InvoiceInput = z.infer<typeof invoiceSchema>;
// Older local invoices retain their original totals until actual hours are entered.
export type Invoice = Omit<InvoiceInput, "hours" | "hourlyRate"> & {
  hours?: number;
  hourlyRate?: number;
  id: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  paymentToken?: string;
  checkout?: {
    accountId: string;
    livemode?: boolean;
    sessionId: string;
    url: string;
    revision: number;
    status: "open" | "complete" | "expired";
    paymentStatus: "paid" | "unpaid" | "no_payment_required";
    expiresAt: number;
    paymentIntentId?: string;
    paidAt?: string;
  };
  emailAcceptedAt?: string;
  emailedRevision?: number;
  emailMessageId?: string;
  emailRecipient?: string;
  emailHistory?: {
    requestId: string;
    messageId: string;
    recipient: string;
    acceptedAt: string;
    revision: number;
  }[];
};
export const money = (amount: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
    amount,
  );
export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
