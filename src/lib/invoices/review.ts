import type { Invoice } from "./model";
import { syncStripeCheckout } from "./stripe";

// Saved invoice history remains readable even if a sandbox checkout was removed.
// Payment writes and document verification still use the strict Stripe checks.
export async function refreshReviewInvoices(
  items: Invoice[],
  id?: string | null,
) {
  let unavailable = 0;
  for (const invoice of items) {
    if (
      (id && invoice.id !== id) ||
      !invoice.checkout ||
      invoice.checkout.paymentStatus === "paid"
    )
      continue;
    try {
      await syncStripeCheckout(invoice);
    } catch {
      unavailable++;
    }
  }
  return unavailable
    ? "Some payment statuses could not be refreshed. Your saved invoices are shown. Do not pay again while verification is pending."
    : undefined;
}
