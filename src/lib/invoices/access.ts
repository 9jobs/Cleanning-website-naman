import type { NextRequest } from "next/server";

const loopback = (host: string) =>
  ["localhost", "127.0.0.1", "[::1]", "::1"].includes(host);
export function productionHostAllowed(host: string) {
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.THRIVE4_ADMIN_ONLINE !== "true" ||
    !process.env.THRIVE4_ADMIN_DATABASE_URL
  )
    return false;
  try {
    const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "invalid");
    if (site.protocol !== "https:") return false;
    return [site.host, process.env.VERCEL_URL]
      .filter(Boolean)
      .includes(host.toLowerCase());
  } catch {
    return false;
  }
}
export function requestOrigin(request: NextRequest) {
  return process.env.NODE_ENV === "production"
    ? `https://${request.headers.get("host")}`
    : `http://${request.headers.get("host")}`;
}
export function localAdminAllowed(
  request: NextRequest,
  allowCheckoutReturn = false,
) {
  const production = productionHostAllowed(request.headers.get("host") || "");
  if (process.env.NODE_ENV !== "development" && !production) return false;
  try {
    if (
      !production &&
      !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i.test(
        request.headers.get("host") || "",
      )
    )
      return false;
    if (
      !production &&
      !loopback(
        new URL(`http://${request.headers.get("host") || "invalid"}`).hostname,
      )
    )
      return false;
    const forwarded = request.headers.get("x-forwarded-for");
    if (
      !production &&
      forwarded &&
      !forwarded
        .split(",")
        .every((ip) => loopback(ip.trim()) || ip.trim() === "::ffff:127.0.0.1")
    )
      return false;
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      const url = new URL(request.url);
      const checkoutReturn =
        allowCheckoutReturn &&
        request.method === "GET" &&
        request.headers.get("sec-fetch-mode") === "navigate" &&
        request.headers.get("sec-fetch-dest") === "document" &&
        url.pathname === "/admin/review" &&
        ["success", "cancelled"].includes(
          url.searchParams.get("checkout") || "",
        ) &&
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
          url.searchParams.get("id") || "",
        );
      if (!checkoutReturn) return false;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      if (
        new URL(request.headers.get("origin") || "invalid").origin !==
        requestOrigin(request)
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}
export const privateHeaders = {
  "Cache-Control": "no-store, private",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};
export const adminHtmlHeaders = {
  ...privateHeaders,
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self' about:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
};
