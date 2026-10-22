import { NextRequest } from "next/server";
import { adminHtmlHeaders, localAdminAllowed } from "@/lib/invoices/access";
import { adminShell } from "@/lib/invoices/shell";
import { authenticatedAdmin, adminLoginLocation } from "@/lib/invoices/auth";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (!localAdminAllowed(request))
    return new Response("Not found", { status: 404 });
  if (!(await authenticatedAdmin(request)))
    return new Response(null, {
      status: 303,
      headers: { ...adminHtmlHeaders, Location: adminLoginLocation(request) },
    });
  return new Response(adminShell("create"), { headers: adminHtmlHeaders });
}
