import { checkReference } from "@/lib/server";
import { Button } from "@/components/ui";
import { CheckCircle, Info } from "lucide-react";
export const metadata = {
  title: "Booking Request Status",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference = "" } = await searchParams;
  const confirmed = await checkReference(reference, "booking");
  return (
    <section className="container status-screen">
      <div className="panel">
        {confirmed ? <CheckCircle size={45} /> : <Info size={45} />}
        <h1>
          {confirmed
            ? "Your cleaning request has been received."
            : "No active booking request found."}
        </h1>
        <p>
          {confirmed ? (
            <>
              Booking Reference: <strong>{reference}</strong>
              <br />
              Our team will review your property details, verify local cleaner
              availability, and confirm your final written quote. Your
              appointment is finalized only once confirmed by our team.
            </>
          ) : (
            "Submit a cleaning request to receive a confirmation reference. Preferred appointment dates are confirmed once reviewed by our team."
          )}
        </p>
        <Button href={confirmed ? "/" : "/book"}>
          {confirmed ? "Return to Homepage" : "Book a Clean"}
        </Button>
      </div>
    </section>
  );
}
