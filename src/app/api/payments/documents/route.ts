import { NextRequest } from "next/server";
import { localAdminAllowed, privateHeaders } from "@/lib/invoices/access";
import { InvoiceError } from "@/lib/invoices/store";
import { getPaymentDocument } from "@/lib/payments/documents";
import { paymentPdf } from "@/lib/payments/pdf";
import { authenticatedAdmin } from "@/lib/invoices/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!localAdminAllowed(request))
    return new Response("Not found", { status: 404, headers: privateHeaders });
  if (
    request.nextUrl.searchParams.has("invoice_id") &&
    !(await authenticatedAdmin(request))
  )
    return Response.json(
      { error: "Please sign in to your admin account." },
      { status: 401, headers: privateHeaders },
    );
  const kind = request.nextUrl.searchParams.get("type");
  if (kind !== "invoice" && kind !== "receipt")
    return Response.json(
      { error: "Choose invoice or receipt." },
      { status: 400, headers: privateHeaders },
    );
  try {
    const data = await getPaymentDocument({
      sessionId: request.nextUrl.searchParams.get("session_id") || undefined,
      invoiceId: request.nextUrl.searchParams.get("invoice_id") || undefined,
    });
    const bytes = await paymentPdf(data, kind);
    const filename = `Thrive4-${kind}-${kind === "invoice" ? data.invoiceNumber : data.receiptNumber}.pdf`;
    return new Response(Buffer.from(bytes), {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (!(error instanceof InvoiceError))
      console.error(
        "Payment PDF generation failed:",
        error instanceof Error
          ? error.name + ": " + error.message
          : "Unknown error",
      );
    return Response.json(
      {
        error:
          error instanceof InvoiceError
            ? error.message
            : "Could not prepare the payment document. Please retry.",
      },
      {
        status: error instanceof InvoiceError ? error.status : 502,
        headers: privateHeaders,
      },
    );
  }
}
