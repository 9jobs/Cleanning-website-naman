import { productionHostAllowed } from "@/lib/invoices/access";
import { headers, cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { authenticatedAdmin } from "@/lib/invoices/auth";
import { getPaymentDocument } from "@/lib/payments/documents";
import { PaymentSuccess } from "@/components/payment-success";
import { Button } from "@/components/ui";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Payment Receipt",
  robots: { index: false, follow: false },
};
export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; invoice_id?: string }>;
}) {
  const host = (await headers()).get("host") || "";
  if (
    !productionHostAllowed(host) &&
    (process.env.NODE_ENV !== "development" ||
      !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host))
  )
    notFound();
  const query = await searchParams;
  if (
    query.invoice_id &&
    !(await authenticatedAdmin({ cookies: await cookies() }))
  )
    redirect(
      `/admin/login?next=${encodeURIComponent(`/admin/review?id=${query.invoice_id}`)}`,
    );
  const reference = {
    sessionId: query.session_id,
    invoiceId: query.invoice_id,
  };
  let payment: Awaited<ReturnType<typeof getPaymentDocument>> | undefined;
  try {
    payment = await getPaymentDocument(reference);
  } catch {
    /* Keep unverified payments out of the receipt view. */
  }
  if (payment)
    return (
      <PaymentSuccess payment={payment} reference={reference} initialReceipt />
    );
  return (
    <section className="container status-screen">
      <div className="panel">
        <h1>Receipt not available yet.</h1>
        <p>
          A receipt can be downloaded only after the completed payment is
          verified. Please do not pay again while verification is pending.
        </p>
        <Button href={query.invoice_id ? "/admin/review" : "/pricing"}>
          Back
        </Button>
      </div>
    </section>
  );
}
