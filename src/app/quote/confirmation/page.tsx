import { checkReference } from "@/lib/server";
import { Button } from "@/components/ui";
import { CheckCircle, Info } from "lucide-react";
export const metadata = {
  title: "Quote Enquiry Status",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference = "" } = await searchParams;
  const confirmed = await checkReference(reference, "quote");
  return (
    <section className="container status-screen">
      <div className="panel">
        {confirmed ? <CheckCircle size={45} /> : <Info size={45} />}
        <h1>
          {confirmed
            ? "Your quote enquiry has been received."
            : "No active quote enquiry found."}
        </h1>
        <p>
          {confirmed ? (
            <>
              Quote Reference: <strong>{reference}</strong>
              <br />
              Our team will review your cleaning requirements and contact you
              promptly with a personalised quote.
            </>
          ) : (
            "Submit a cleaning quote request to receive a reference. No quote has been requested from this session."
          )}
        </p>
        <Button href={confirmed ? "/" : "/quote"}>
          {confirmed ? "Return to Homepage" : "Request a Quote"}
        </Button>
      </div>
    </section>
  );
}
