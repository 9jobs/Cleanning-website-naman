import "server-only";
import nodemailer from "nodemailer";
import { services } from "./data";
import type { ContactRequest } from "./contact-validation";

export function contactMailReady() {
  return Boolean(
    process.env.CONTACT_SMTP_USER &&
    process.env.CONTACT_SMTP_PASSWORD &&
    process.env.CONTACT_TO_EMAIL,
  );
}
export function contactTransport() {
  if (!contactMailReady()) throw new Error("Contact mail is not configured");
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.CONTACT_SMTP_USER,
      pass: process.env.CONTACT_SMTP_PASSWORD?.replace(/\s/g, ""),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}
export async function sendContactMail(data: ContactRequest, reference: string) {
  const service =
    services.find((item) => item.slug === data.service)?.name || data.service;
  const commercial =
    data.property === "Office" ||
    data.property === "Other commercial space" ||
    ["office-cleaning", "commercial-cleaning"].includes(data.service);
  const text = [
    "NEW THRIVE4 CLEANING WEBSITE ENQUIRY",
    `Reference: ${reference}`,
    `Received: ${new Date().toISOString()}`,
    "",
    "CONTACT DETAILS",
    `Full name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    "",
    "CLEANING REQUEST",
    `Service: ${service}`,
    `Property type: ${data.property}`,
    `Suburb / postcode: ${data.location}`,
    ...(commercial
      ? [`Approximate floor area: ${data.size || "Not supplied"} m²`]
      : [`Bedrooms: ${data.bedrooms}`, `Bathrooms: ${data.bathrooms}`]),
    `Frequency: ${data.frequency}`,
    `Preferred date: ${data.date || "Not specified"}`,
    "",
    "ADDITIONAL REQUIREMENTS",
    data.message || "None supplied.",
    "",
    "The customer agreed to be contacted about this enquiry.",
    "This is an enquiry, not a confirmed appointment.",
    "Reply to this email to contact the customer directly.",
  ].join("\n");
  const result = await contactTransport().sendMail({
    from: {
      name: "Thrive4 Cleaning Website",
      address: process.env.CONTACT_SMTP_USER!,
    },
    to: process.env.CONTACT_TO_EMAIL!,
    replyTo: { name: data.name.replace(/[\r\n]/g, " "), address: data.email },
    subject: `New cleaning enquiry — ${service} — ${data.name.replace(/[\r\n]/g, " ")}`,
    text,
    messageId: `<${reference}@thrive4cleaning.local>`,
    headers: { "X-Thrive4-Reference": reference },
  });
  if (!result.accepted?.length || result.rejected?.length)
    throw new Error("The mail server did not accept the enquiry");
  return result;
}
