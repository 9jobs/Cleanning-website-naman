import { productionHostAllowed } from "@/lib/invoices/access";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { Button } from "@/components/ui";
import { getPaymentDocument } from "@/lib/payments/documents";
import { PaymentSuccess } from "@/components/payment-success";
import { notifyPaidPricingBooking } from "@/lib/pricing-booking-server";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Test Payment Status",
  robots: { index: false, follow: false },
};
export default async function PaymentConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const host = (await headers()).get("host") || "";
  if (
    !productionHostAllowed(host) &&
    (process.env.NODE_ENV !== "development" ||
      !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host))
  )
    notFound();
  const { session_id = "" } = await searchParams;
  let payment: Awaited<ReturnType<typeof getPaymentDocument>> | undefined;
  try {
    payment = await getPaymentDocument({ sessionId: session_id });
  } catch {
    /* No success claims from query parameters or failed verification. */
  }
  if (payment) {
    // A verified return is a fallback; webhooks also notify when this page is never opened.
    try {
      await notifyPaidPricingBooking(session_id);
    } catch {
      console.error("Paid pricing booking notification pending webhook retry");
    }
    return (
      <PaymentSuccess payment={payment} reference={{ sessionId: session_id }} />
    );
  }
  return (
    <section className="container status-screen">
      <div className="panel">
        <Info size={45} />
        <h1>Payment has not been confirmed.</h1>
        <p>
          We could not verify a completed payment. Refresh this page to check
          again. Please do not pay again while verification is pending.
        </p>
        <Button href="/pricing">Back to Pricing</Button>
      </div>
    </section>
  );
}
