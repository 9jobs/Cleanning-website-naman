import { NextRequest } from "next/server";
import { adminHtmlHeaders, localAdminAllowed } from "@/lib/invoices/access";
import { readInvoices } from "@/lib/invoices/store";
import { money } from "@/lib/invoices/model";
import { paymentPreviewShell } from "@/lib/invoices/shell";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  if (!localAdminAllowed(request))
    return new Response("Not found", { status: 404 });
  const { token } = await context.params;
  if (!/^[a-f0-9]{48}$/.test(token))
    return new Response("Payment preview not found.", {
      status: 404,
      headers: adminHtmlHeaders,
    });
  const invoice = (await readInvoices()).find(
    (invoice) => invoice.paymentToken === token,
  );
  if (!invoice)
    return new Response(
      "This preview link is invalid or has been replaced. Request the latest invoice link.",
      { status: 404, headers: adminHtmlHeaders },
    );
  const expired =
    invoice.validUntil <
    new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
  return new Response(
    paymentPreviewShell(
      invoice.name,
      invoice.number,
      money(invoice.amount),
      invoice.description,
      expired,
    ),
    { headers: adminHtmlHeaders },
  );
}
