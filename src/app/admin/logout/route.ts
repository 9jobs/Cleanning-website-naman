import { NextRequest, NextResponse } from "next/server";
import { localAdminAllowed, privateHeaders } from "@/lib/invoices/access";
import { ADMIN_COOKIE, endAdminSession } from "@/lib/invoices/auth";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  if (!localAdminAllowed(request))
    return new Response("Not found", { status: 404 });
  await endAdminSession(request);
  const response = new NextResponse(null, {
    status: 303,
    headers: { ...privateHeaders, Location: "/admin/login" },
  });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
