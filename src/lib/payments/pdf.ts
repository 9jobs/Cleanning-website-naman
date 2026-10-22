import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "../config";
import type { PaymentDocument } from "./documents";

export async function paymentPdf(
  data: PaymentDocument,
  kind: "invoice" | "receipt",
) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(
    `Thrive4 Cleaning ${kind} - ${kind === "invoice" ? data.invoiceNumber : data.receiptNumber}`,
  );
  pdf.setAuthor("Thrive4 Cleaning");
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.06, 0.31, 0.24),
    muted = rgb(0.36, 0.43, 0.4),
    line = rgb(0.86, 0.9, 0.87),
    pale = rgb(0.94, 0.97, 0.95);
  const clean = (value: string) =>
    value.normalize("NFKD").replace(/[^\x20-\x7E]/g, " ");
  const text = (
    value: string,
    x: number,
    top: number,
    size = 10,
    font: PDFFont = regular,
    color = green,
  ) =>
    page.drawText(clean(value), {
      x,
      y: 841.89 - top - size,
      size,
      font,
      color,
    });
  const right = (
    value: string,
    x: number,
    top: number,
    size = 10,
    font: PDFFont = regular,
    color = green,
  ) =>
    text(
      value,
      x - font.widthOfTextAtSize(clean(value), size),
      top,
      size,
      font,
      color,
    );
  const rule = (top: number) =>
    page.drawLine({
      start: { x: 48, y: 841.89 - top },
      end: { x: 547, y: 841.89 - top },
      thickness: 0.7,
      color: line,
    });
  const wrap = (
    value: string,
    x: number,
    top: number,
    width: number,
    size = 10,
    font: PDFFont = regular,
  ) => {
    let row = "",
      current = top;
    for (const word of clean(value).split(/\s+/)) {
      if (font.widthOfTextAtSize(row + " " + word, size) > width && row) {
        text(row, x, current, size, font);
        current += 15;
        row = "";
      }
      // Long email addresses and references are wrapped by measured character width.
      for (const letter of (row ? " " : "") + word) {
        if (font.widthOfTextAtSize(row + letter, size) > width) {
          text(row, x, current, size, font);
          current += 15;
          row = "";
        }
        row += letter;
      }
    }
    if (row) text(row, x, current, size, font);
    return current + 15;
  };
  const logo = await pdf.embedPng(
    await readFile(path.join(process.cwd(), "public/brand/thrive4-logo.png")),
  );
  page.drawRectangle({
    x: 0,
    y: 833.89,
    width: 595.28,
    height: 8,
    color: green,
  });
  page.drawImage(logo, { x: 42, y: 841.89 - 108, width: 178, height: 59.33 });
  right(kind === "invoice" ? "INVOICE" : "PAYMENT RECEIPT", 547, 56, 20, bold);
  right(
    kind === "invoice" ? data.invoiceNumber : data.receiptNumber,
    547,
    87,
    9,
    regular,
    muted,
  );
  right(data.live ? "PAID" : "PAID / STRIPE TEST MODE", 547, 108, 9, bold);
  rule(140);
  text("FROM", 48, 161, 8, bold, muted);
  text("Thrive4 Cleaning", 48, 180, 12, bold);
  wrap(site.address, 48, 202, 220, 9);
  text(site.email, 48, 239, 9, regular, muted);
  text(site.phone, 48, 256, 9, regular, muted);
  text(
    kind === "invoice" ? "BILLED TO" : "RECEIVED FROM",
    330,
    161,
    8,
    bold,
    muted,
  );
  let customerY = wrap(data.customerName, 330, 180, 217, 12, bold);
  if (data.customerEmail)
    customerY = wrap(data.customerEmail, 330, customerY + 5, 217, 9);
  const date = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(new Date(data.paidAt));
  text("Payment date", 330, Math.max(239, customerY + 8), 9, regular, muted);
  text(date, 421, Math.max(239, customerY + 8), 9, bold);
  page.drawRectangle({
    x: 48,
    y: 841.89 - 334,
    width: 499,
    height: 30,
    color: pale,
  });
  text("DESCRIPTION", 60, 314, 8, bold, muted);
  right("HOURS", 360, 314, 8, bold, muted);
  right("RATE (AUD)", 447, 314, 8, bold, muted);
  right("AMOUNT", 535, 314, 8, bold, muted);
  const rowEnd = wrap(data.service, 60, 355, 230, 11, bold);
  right(data.hours > 0 ? String(data.hours) : "-", 360, 355, 10);
  right(
    data.hourlyRate > 0 ? `$${data.hourlyRate.toFixed(2)}` : "-",
    447,
    355,
    10,
  );
  right(`$${data.amount.toFixed(2)}`, 535, 355, 11, bold);
  const totalY = Math.max(410, rowEnd + 28);
  rule(totalY);
  right("Subtotal", 447, totalY + 21, 10, regular, muted);
  right(`$${data.amount.toFixed(2)}`, 535, totalY + 21, 10);
  page.drawRectangle({
    x: 307,
    y: 841.89 - (totalY + 97),
    width: 240,
    height: 47,
    color: pale,
  });
  text(
    kind === "receipt" ? "AMOUNT PAID" : "TOTAL PAID",
    321,
    totalY + 65,
    9,
    bold,
  );
  right(`AUD $${data.amount.toFixed(2)}`, 535, totalY + 61, 18, bold);
  text("PAYMENT DETAILS", 48, totalY + 133, 8, bold, muted);
  text("Payment reference", 48, totalY + 156, 9, regular, muted);
  wrap(data.paymentIntentId, 177, totalY + 156, 370, 9);
  text("Payment method", 48, totalY + 179, 9, regular, muted);
  text(
    data.cardLast4
      ? `${data.cardBrand.toUpperCase()} ending ${data.cardLast4}`
      : "Stripe",
    177,
    totalY + 179,
    9,
    bold,
  );
  rule(714);
  text("Thank you for choosing Thrive4 Cleaning.", 48, 733, 10, bold);
  text(
    data.live
      ? "Payment received. Not a tax invoice."
      : "TEST DOCUMENT - No real money was collected. Not a tax invoice.",
    48,
    754,
    9,
    regular,
    muted,
  );
  text(
    "An appointment is confirmed separately by the Thrive4 team.",
    48,
    773,
    8,
    regular,
    muted,
  );
  right("1 / 1", 547, 792, 8, regular, muted);
  return pdf.save();
}
