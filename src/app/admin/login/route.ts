import { NextRequest, NextResponse } from "next/server";
import {
  localAdminAllowed,
  adminHtmlHeaders,
  privateHeaders,
} from "@/lib/invoices/access";
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  authenticatedAdmin,
  adminAuthReady,
  issueAdminSession,
  adminLoginThrottled,
  recordLoginFailure,
  endAdminSession,
  safeAdminNext,
  verifyAdminCredentials,
} from "@/lib/invoices/auth";
import { loginShell } from "@/lib/invoices/login-shell";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const page = (next: string, error = "", status = 200) =>
  new Response(loginShell(next, error), { status, headers: adminHtmlHeaders });
export async function GET(request: NextRequest) {
  if (!localAdminAllowed(request))
    return new Response("Not found", { status: 404 });
  const next = safeAdminNext(request.nextUrl.searchParams.get("next"));
  if (await authenticatedAdmin(request))
    return new Response(null, {
      status: 303,
      headers: { ...privateHeaders, Location: next },
    });
  return page(next);
}
export async function POST(request: NextRequest) {
  if (!localAdminAllowed(request))
    return new Response("Not found", { status: 404 });
  if (
    !request.headers
      .get("content-type")
      ?.startsWith("application/x-www-form-urlencoded")
  )
    return page("/admin/review", "Invalid sign-in request.", 400);
  const body = await request.text();
  if (Buffer.byteLength(body) > 4096)
    return page("/admin/review", "Invalid sign-in request.", 400);
  const form = new URLSearchParams(body);
  const next = safeAdminNext(form.get("next"));
  if (!adminAuthReady())
    return page(
      next,
      "Admin sign-in is not configured. Please contact the site administrator.",
      503,
    );
  if (await adminLoginThrottled())
    return page(
      next,
      "Too many sign-in attempts. Please try again in 15 minutes.",
      429,
    );
  if (
    !(await verifyAdminCredentials(
      form.get("email") || "",
      form.get("password") || "",
    ))
  ) {
    recordLoginFailure();
    return page(next, "Incorrect email or password.", 401);
  }
  await endAdminSession(request);
  const response = new NextResponse(null, {
    status: 303,
    headers: { ...privateHeaders, Location: next },
  });
  response.cookies.set(ADMIN_COOKIE, await issueAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production" ||
      request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
