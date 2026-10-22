import { createHash } from "node:crypto";
import {
  findInvoice,
  invoiceTransaction,
  InvoiceError,
} from "../invoices/store";
import {
  syncStripeCheckout,
  verifiedPaymentDetails,
  verifyPricingPayment,
  invoiceForCheckout,
} from "../invoices/stripe";

export type PaymentDocument = {
  live?: boolean;
  key: string;
  invoiceNumber: string;
  receiptNumber: string;
  service: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  customerName: string;
  customerEmail: string;
  paidAt: string;
  paymentIntentId: string;
  cardBrand: string;
  cardLast4: string;
};
export function documentReferences(key: string) {
  const reference = createHash("sha256")
    .update(key)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
  return {
    invoiceNumber: `T4-INV-${reference}`,
    receiptNumber: `T4-RCT-${reference}`,
  };
}
export async function getPaymentDocument(query: {
  sessionId?: string;
  invoiceId?: string;
}): Promise<PaymentDocument> {
  if (Boolean(query.sessionId) === Boolean(query.invoiceId))
    throw new InvoiceError("Choose one payment reference.");
  if (query.sessionId) {
    const invoiceId = await invoiceForCheckout(query.sessionId);
    if (invoiceId) {
      const invoice = await invoiceTransaction(async (items) =>
        structuredClone(findInvoice(items, invoiceId)),
      );
      if (invoice.checkout?.sessionId !== query.sessionId)
        throw new InvoiceError(
          "This invoice checkout is no longer current.",
          409,
        );
      return getPaymentDocument({ invoiceId });
    }
    const payment = await verifyPricingPayment(query.sessionId);
    if (!payment.paid || !payment.paymentIntentId)
      throw new InvoiceError(
        "Documents are available only after Stripe confirms payment.",
        409,
      );
    const details = await verifiedPaymentDetails(payment.paymentIntentId, {
      amount: payment.amount,
      app: "thrive4-pricing-checkout",
      service: payment.serviceSlug,
      live: payment.live,
    });
    return {
      key: payment.sessionId,
      live: payment.live,
      ...documentReferences(payment.sessionId),
      service: payment.service,
      hours: payment.hours,
      hourlyRate: payment.hourlyRate,
      amount: payment.amount,
      customerName: payment.customerName,
      customerEmail: payment.customerEmail,
      paymentIntentId: payment.paymentIntentId,
      ...details,
    };
  }
  if (!/^[a-f0-9-]{36}$/i.test(query.invoiceId!))
    throw new InvoiceError("Invalid invoice reference.");
  const invoice = await invoiceTransaction(async (items) => {
    const item = findInvoice(items, query.invoiceId!);
    await syncStripeCheckout(item);
    return structuredClone(item);
  });
  if (
    invoice.checkout?.paymentStatus !== "paid" ||
    invoice.checkout.status !== "complete" ||
    !invoice.checkout.paymentIntentId
  )
    throw new InvoiceError(
      "Documents are available only after Stripe confirms payment.",
      409,
    );
  const details = await verifiedPaymentDetails(
    invoice.checkout.paymentIntentId,
    {
      amount: invoice.amount,
      app: "thrive4-local-invoices",
      invoiceId: invoice.id,
      live:
        invoice.checkout.livemode ??
        invoice.checkout.accountId === "acct_1USt0hPqa21oiEVr",
    },
  );
  return {
    key: invoice.checkout.sessionId,
    live:
      invoice.checkout.livemode ??
      invoice.checkout.accountId === "acct_1USt0hPqa21oiEVr",
    ...documentReferences(invoice.checkout.sessionId),
    invoiceNumber: invoice.number,
    service: invoice.description,
    hours: invoice.hours || 0,
    hourlyRate: invoice.hourlyRate || 0,
    amount: invoice.amount,
    customerName: invoice.name,
    customerEmail: invoice.email,
    paymentIntentId: invoice.checkout.paymentIntentId,
    ...details,
  };
}
