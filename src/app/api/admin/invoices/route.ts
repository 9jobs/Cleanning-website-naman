import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  localAdminAllowed,
  privateHeaders,
  requestOrigin,
} from "@/lib/invoices/access";
import { authenticatedAdmin } from "@/lib/invoices/auth";
import { refreshReviewInvoices } from "@/lib/invoices/review";
import {
  createStripeCheckout,
  prepareInvoiceMutation,
  syncStripeCheckout,
  stripeTestReady,
} from "@/lib/invoices/stripe";
import { invoiceSchema } from "@/lib/invoices/model";
import {
  deleteInvoice,
  archiveInvoice,
  findInvoice,
  generatePreviewLink,
  InvoiceError,
  invoiceTransaction,
  paymentUrl,
  saveInvoice,
} from "@/lib/invoices/store";
import {
  invoiceEmailHtml,
  invoiceMailReady,
  sendInvoiceEmail,
} from "@/lib/invoices/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: privateHeaders });
const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("delete"),
    id: z.string().uuid(),
    revision: z.number().int().positive(),
    confirm: z.literal(true),
  }),
  z.object({
    action: z.literal("save"),
    data: invoiceSchema,
    id: z.string().uuid().optional(),
    revision: z.number().int().positive().optional(),
  }),
  z.object({ action: z.literal("preview"), data: invoiceSchema }),
  z.object({
    action: z.literal("generate"),
    id: z.string().uuid(),
    revision: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("send"),
    id: z.string().uuid(),
    revision: z.number().int().positive(),
    confirm: z.literal(true),
    resend: z.boolean().optional(),
    requestId: z.string().uuid().optional(),
  }),
]);
export async function GET(request: NextRequest) {
  if (!localAdminAllowed(request)) return json({ error: "Not found." }, 404);
  if (!(await authenticatedAdmin(request)))
    return json({ error: "Please sign in to your admin account." }, 401);
  try {
    let paymentSyncWarning: string | undefined;
    const invoices = await invoiceTransaction(async (items) => {
      if (stripeTestReady()) {
        paymentSyncWarning = await refreshReviewInvoices(
          items,
          request.nextUrl.searchParams.get("id"),
        );
      }
      return items;
    });
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const invoice = findInvoice(invoices, id);
      const link = paymentUrl(invoice, requestOrigin(request));
      return json({
        invoice,
        paymentSyncWarning,
        link,
        html: invoiceEmailHtml(invoice, link),
        mailReady: invoiceMailReady(),
        stripeTestReady: stripeTestReady(),
      });
    }
    return json({
      invoices,
      paymentSyncWarning,
      mailReady: invoiceMailReady(),
      stripeTestReady: stripeTestReady(),
    });
  } catch (error) {
    return json(
      {
        error:
          error instanceof InvoiceError
            ? error.message
            : "Could not read local invoices.",
      },
      error instanceof InvoiceError ? error.status : 500,
    );
  }
}
export async function POST(request: NextRequest) {
  if (!localAdminAllowed(request)) return json({ error: "Not found." }, 404);
  if (!(await authenticatedAdmin(request)))
    return json({ error: "Please sign in to your admin account." }, 401);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Send JSON." }, 415);
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Missing request." }, 400);
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 16000) {
        await reader.cancel();
        return json({ error: "Invoice is too large." }, 413);
      }
      chunks.push(value);
    }
    const parsed = actionSchema.safeParse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (!parsed.success)
      return json(
        {
          error: parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(" "),
        },
        400,
      );
    const action = parsed.data;
    if (action.action === "preview")
      return json({ html: invoiceEmailHtml(action.data) });
    if (action.action === "save" && action.id && !action.revision)
      return json({ error: "Refresh the invoice before editing." }, 409);
    return await invoiceTransaction(async (invoices) => {
      if (action.action === "delete") {
        const original = findInvoice(invoices, action.id, action.revision);
        await prepareInvoiceMutation(original);
        await archiveInvoice(original, "delete");
        return json({
          deleted: deleteInvoice(invoices, action.id, action.revision),
        });
      }
      if (action.action === "save") {
        if (action.id) {
          const original = findInvoice(invoices, action.id, action.revision);
          await prepareInvoiceMutation(original);
          await archiveInvoice(original, "edit");
        }
        const invoice = saveInvoice(
          invoices,
          action.data,
          action.id,
          action.revision,
        );
        return json({ invoice });
      }
      const invoice = findInvoice(invoices, action.id, action.revision);
      if (action.action === "generate") {
        if (process.env.THRIVE4_STRIPE_SECRET_KEY)
          await createStripeCheckout(invoice, requestOrigin(request));
        else generatePreviewLink(invoice);
      }
      if (action.action === "send" && invoice.checkout)
        await syncStripeCheckout(invoice);
      const link = paymentUrl(invoice, requestOrigin(request));
      if (action.action === "send") {
        if (!link)
          throw new InvoiceError(
            "Generate a payment preview link before sending.",
          );
        if (
          invoice.validUntil <
          new Date().toLocaleDateString("en-CA", {
            timeZone: "Australia/Melbourne",
          })
        )
          throw new InvoiceError(
            "This invoice has expired. Edit its dates before sending.",
          );
        if (!invoiceMailReady())
          throw new InvoiceError(
            "Email is not configured. Add CONTACT_SMTP_USER and CONTACT_SMTP_PASSWORD to .env.local, then restart the local server.",
            503,
          );
        const requestId = action.requestId || randomUUID();
        const alreadyProcessed = invoice.emailHistory?.some(
          (item) => item.requestId === requestId,
        );
        if (
          !alreadyProcessed &&
          (invoice.emailedRevision !== invoice.revision || action.resend)
        ) {
          let receipt: Awaited<ReturnType<typeof sendInvoiceEmail>>;
          try {
            receipt = await sendInvoiceEmail(invoice, link);
          } catch (error) {
            const code = (error as { code?: string }).code;
            const message =
              code === "EAUTH"
                ? "Gmail sign-in failed. Update the SMTP app password in .env.local and restart the local server. This invoice was not sent."
                : code === "EENVELOPE"
                  ? "The mail server rejected the recipient address. Check the client email and try again."
                  : "The email server could not confirm this send. Check the connection and SMTP configuration before retrying.";
            throw new InvoiceError(message, 502);
          }
          invoice.emailAcceptedAt = new Date().toISOString();
          invoice.emailedRevision = invoice.revision;
          invoice.emailMessageId = receipt.messageId;
          invoice.emailRecipient = receipt.recipient;
          invoice.emailHistory = [
            ...(invoice.emailHistory || []),
            {
              requestId,
              messageId: receipt.messageId,
              recipient: receipt.recipient,
              acceptedAt: invoice.emailAcceptedAt,
              revision: invoice.revision,
            },
          ].slice(-20);
        }
      }
      return json({
        invoice,
        link,
        html: invoiceEmailHtml(invoice, link),
        mailReady: invoiceMailReady(),
        stripeTestReady: stripeTestReady(),
      });
    });
  } catch (error) {
    if (error instanceof SyntaxError)
      return json({ error: "Invalid JSON." }, 400);
    return json(
      {
        error:
          error instanceof InvoiceError
            ? error.message
            : "Could not save this invoice locally.",
      },
      error instanceof InvoiceError ? error.status : 500,
    );
  }
}
