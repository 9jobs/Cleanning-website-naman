import { stripeLiveMode, THRIVE4_LIVE_ACCOUNT } from "./stripe-mode";
import nodemailer from "nodemailer";
import { site } from "../config";
import {
  escapeHtml as e,
  money,
  type InvoiceInput,
  type Invoice,
} from "./model";

export function invoiceMailReady() {
  return Boolean(
    process.env.CONTACT_SMTP_USER && process.env.CONTACT_SMTP_PASSWORD,
  );
}
export function clientPaymentLink(link?: string) {
  if (!link) return undefined;
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    const privateHost =
      host === "localhost" ||
      host === "[::1]" ||
      host === "0.0.0.0" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    return url.protocol === "https:" &&
      !privateHost &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function invoiceEmailHtml(
  invoice: InvoiceInput | Invoice,
  link?: string,
  logoSrc = "/brand/thrive4-logo.png",
) {
  const paid =
    "checkout" in invoice && invoice.checkout?.paymentStatus === "paid";
  const live =
    "checkout" in invoice && invoice.checkout
      ? invoice.checkout.accountId === THRIVE4_LIVE_ACCOUNT
      : stripeLiveMode();
  const customerLink = paid ? undefined : clientPaymentLink(link);
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  const row = (symbol: string, label: string, value: string) =>
    `<tr><td style="width:9%;padding:8px 0;border-bottom:1px solid #edf1ed;vertical-align:middle"><span style="display:inline-block;width:27px;height:27px;line-height:27px;border-radius:7px;background:#eff7f2;color:#276b55;text-align:center;font-size:16px;font-family:Arial,Helvetica,sans-serif;font-weight:600">${symbol}</span></td><td style="width:34%;padding:8px 6px;color:#405d54;font-size:13px;border-bottom:1px solid #edf1ed">${e(label)}</td><td style="width:57%;padding:8px 0;color:#173d32;font-size:13px;font-weight:600;border-bottom:1px solid #edf1ed;overflow-wrap:anywhere">${e(value)}</td></tr>`;
  const defaultNote =
    "Thank you for choosing Thrive4 Cleaning. Please contact our team if you have any questions about this invoice.";
  const notes =
    invoice.notes && invoice.notes !== defaultNote
      ? `<p style="margin:12px 0 0;color:#718078;font-size:12px;line-height:1.6;text-align:center">${e(invoice.notes).replace(/\n/g, "<br>")}</p>`
      : "";
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your invoice | Thrive4 Cleaning</title><style>@media only screen and (max-width:420px){.invoice-pad{padding:18px!important}.invoice-amount{font-size:32px!important}.invoice-logo{width:230px!important;max-width:100%!important}}</style></head><body style="margin:0;background:#f2f9f6;font-family:Arial,Helvetica,sans-serif;color:#173a36;overflow-wrap:anywhere;word-break:break-word">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f9f6;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="width:100%;max-width:520px;background:#ffffff;border:1px solid #e8f0eb;border-radius:17px;box-shadow:0 12px 36px rgba(27,89,66,0.16);overflow:hidden"><tr><td class="invoice-pad" style="padding:22px 24px 18px">
  <div style="text-align:center;margin-bottom:15px"><img class="invoice-logo" src="${e(logoSrc)}" alt="Thrive4 Cleaning" width="264" height="88" style="display:block;width:264px;max-width:100%;height:auto;margin:0 auto;border:0"></div>
  <div style="text-align:center;margin:0 0 18px"><p style="font-size:15px;line-height:1.6;color:#213e3d;margin:0 0 3px">Dear <strong>${e(invoice.name)}</strong>,</p><p style="font-size:13px;color:#526c61;line-height:1.6;margin:0">Thank you for choosing Thrive4 Cleaning.</p></div>
  <div style="padding:18px 21px;margin-bottom:10px;border-radius:11px;background:#edf7f1;background:linear-gradient(110deg,#edf7f1,#f5faf6)"><p style="font-size:10px;letter-spacing:2px;color:#506f61;margin:0 0 5px">TOTAL DUE</p><div class="invoice-amount" style="font-size:38px;line-height:1.2;letter-spacing:-1px;font-weight:700;color:#075440">AUD ${e(money(invoice.amount))}</div></div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed">${row("&#8962;", "Service", invoice.description)}${invoice.numberOfPeople !== undefined ? row("&#9786;", "Number of people", String(invoice.numberOfPeople)) : ""}${invoice.hours !== undefined ? row("&#9719;", "Hours worked", `${invoice.hours} hrs`) : ""}${invoice.hourlyRate !== undefined ? row("$", "Hourly rate", `AUD ${money(invoice.hourlyRate)} / hr`) : ""}${row("&#9638;", "Invoice date", formatDate(invoice.invoiceDate))}${row("&#9638;", "Due date", formatDate(invoice.dueDate))}${row("&#9993;&#65038;", "Billed to", invoice.email)}</table>
  <div style="margin:19px 0 0;text-align:center">${paid ? `<span style="display:block;padding:14px 18px;border-radius:11px;background:#edf7f1;color:#075440;font-size:14px;font-weight:700">Paid${live ? "" : " · Stripe test mode"}</span>` : customerLink ? `<a href="${e(customerLink)}" target="_blank" rel="noopener" style="display:block;padding:14px 18px;border-radius:11px;background:#0e6b50;background:linear-gradient(100deg,#11775c,#075b45);box-shadow:0 4px 10px rgba(15,98,74,0.12);color:white;font-size:14px;font-weight:700;text-decoration:none">Pay Now &nbsp; →</a>` : `<span aria-disabled="true" style="display:block;padding:14px 18px;border-radius:11px;background:#e7eee8;color:#496b58;font-size:14px;font-weight:600">Pay Now · setup pending</span>`}</div>
  <p style="margin:9px 0 0;text-align:center;font-size:12px;line-height:1.7;color:#5b6e61">${paid ? (live ? "Payment securely verified by Stripe." : "Payment verified in the Thrive4 Stripe sandbox. No real money was collected.") : customerLink ? (live ? "Complete your payment securely with Stripe." : "Stripe test mode: use a test card only. No real money is collected.") : "Online payment is not enabled yet. Please contact us to arrange payment."} No card will be charged automatically.</p>${notes}
  <div style="margin-top:19px;padding-top:14px;border-top:1px solid #dbe6df;text-align:center;color:#426354;font-size:12px;line-height:1.8"><strong style="color:#234f3d">Thrive4 Cleaning</strong><br><a href="mailto:${e(site.email)}" style="display:inline-block;color:#32634e!important;text-decoration:none!important;margin:0 5px">${e(site.email)}</a><span style="color:#9aafa1"> · </span><a href="tel:${e(site.phone.replace(/\s/g, ""))}" style="display:inline-block;color:#32634e!important;text-decoration:none!important;margin:0 5px">${e(site.phone)}</a><div style="font-size:11px;color:#506c5d;margin-top:3px">${e(site.address)}</div></div>
  </td></tr></table></td></tr></table></body></html>`;
}
export async function sendInvoiceEmail(invoice: Invoice, link: string) {
  if (!invoiceMailReady()) throw new Error("Invoice email is not configured.");
  const sender = process.env.CONTACT_SMTP_USER!.trim().toLowerCase();
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: sender,
      pass: process.env.CONTACT_SMTP_PASSWORD?.replace(/\s/g, ""),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  try {
    const customerLink = clientPaymentLink(link);
    const result = await transport.sendMail({
      from: {
        name: "Thrive4 Cleaning",
        address: sender,
      },
      to: invoice.email,
      subject: "Your cleaning invoice | Thrive4 Cleaning",
      html: invoiceEmailHtml(
        invoice,
        customerLink,
        "https://thrive4-invoice-assets.vercel.app/thrive4-logo.png",
      ),
      text: `Dear ${invoice.name},\n\nThank you for choosing Thrive4 Cleaning.\n${invoice.description}\n${invoice.numberOfPeople !== undefined ? `Number of people: ${invoice.numberOfPeople}\n` : ""}${invoice.hours !== undefined && invoice.hourlyRate !== undefined ? `Hours worked: ${invoice.hours}\nHourly rate: AUD ${money(invoice.hourlyRate)} / hr\n` : ""}Total due: AUD ${money(invoice.amount)}\nInvoice date: ${invoice.invoiceDate}\nDue date: ${invoice.dueDate}\n\n${customerLink ? `Pay Now: ${customerLink}` : "Online payment is not enabled yet. Please contact us to arrange payment."}\nNo automatic charges will be made.\n\n${invoice.notes}\n\nThrive4 Cleaning\n${site.email}\n${site.phone}\n${site.address}`,
      headers: { "X-Thrive4-Invoice": invoice.number },
    });
    if (!result.accepted?.length || result.rejected?.length)
      throw new Error("SMTP did not accept the email.");
    return { messageId: result.messageId, recipient: invoice.email };
  } finally {
    transport.close();
  }
}
