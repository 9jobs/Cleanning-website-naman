import { services } from "../data";
import { escapeHtml } from "./model";
import { stripeTestReady } from "./stripe";
import { invoiceMailReady } from "./email";

export function adminShell(view: "create" | "review") {
  const online = process.env.THRIVE4_ADMIN_ONLINE === "true";
  const configuration = JSON.stringify({
    online,
    view,
    mailReady: invoiceMailReady(),
    stripeTestReady: stripeTestReady(),
    services: services.map(({ slug, name }) => ({ slug, name })),
  }).replace(/</g, "\\u003c");
  const icon = (name: string) =>
    name === "create"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 3h10v18l-3-2-2 2-2-2-3 2V3Z"/><path d="M10 8h4m-4 4h4"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 11 2 2 4-4M9 17h6"/></svg>`;
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${view === "create" ? "Create" : "Review"} Invoice | Thrive4 Admin</title><link rel="icon" href="/icon.svg"><link rel="stylesheet" href="/admin/invoices.css"><script id="admin-config" type="application/json">${configuration}</script><script defer src="/admin/invoices.js"></script></head>
  <body class="admin-app"><a class="skip-admin" href="#workspace">Skip to workspace</a><div class="admin-layout">
  <aside class="sidebar"><a class="brand" href="/admin" aria-label="Thrive4 invoice admin"><img src="/admin/logo.svg" alt="Thrive4 Cleaning"></a><div class="workspace-label"><span class="status-dot"></span> ADMIN WORKSPACE</div>
  <div class="nav-label">INVOICES</div><nav aria-label="Invoice navigation"><a class="nav-link ${view === "create" ? "active" : ""}" ${view === "create" ? 'aria-current="page"' : ""} href="/admin">${icon("create")}<span>Create Invoice</span><span class="nav-arrow">↗</span></a><a class="nav-link ${view === "review" ? "active" : ""}" ${view === "review" ? 'aria-current="page"' : ""} href="/admin/review">${icon("review")}<span>Review Invoice</span></a></nav>
  <div class="sidebar-bottom"><form method="post" action="/admin/logout"><button class="admin-logout" type="submit">Sign out <span aria-hidden="true">↗</span></button></form><a class="website-link" href="/" target="_blank" rel="noopener">View Thrive4 website <span>↗</span></a><div class="workspace-owner"><span class="owner-avatar">T4</span><div>Thrive4 Cleaning<small>${online ? "Secure admin workspace" : "Local admin workspace"}</small></div></div></div></aside>
  <div class="workspace"><header class="topbar"><div><span class="breadcrumb">Workspace</span><span class="breadcrumb-divider">/</span><strong>Invoices</strong></div><div class="topbar-right"><span class="local-badge"><span class="status-dot"></span> ${online ? "Secure access" : "Localhost only"}</span><span class="top-avatar">T4</span></div></header>
  <main id="workspace" tabindex="-1"><div id="app-content"><div class="loading-state">Loading your invoice workspace…</div></div></main><footer class="admin-footer"><span>THRIVE4 CLEANING</span><span>A little less admin. A little more room to thrive.</span></footer></div></div>
  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
  <dialog id="payment-result-dialog" aria-labelledby="payment-result-title"><form method="dialog"><div class="payment-confetti" aria-hidden="true"><i style="--piece:0"></i><i style="--piece:1"></i><i style="--piece:2"></i><i style="--piece:3"></i><i style="--piece:4"></i><i style="--piece:5"></i><i style="--piece:6"></i><i style="--piece:7"></i><i style="--piece:8"></i><i style="--piece:9"></i><i style="--piece:10"></i><i style="--piece:11"></i><i style="--piece:12"></i><i style="--piece:13"></i><i style="--piece:14"></i><i style="--piece:15"></i><i style="--piece:16"></i><i style="--piece:17"></i><i style="--piece:18"></i><i style="--piece:19"></i></div><div class="dialog-symbol" id="payment-result-symbol">✓</div><h2 id="payment-result-title">Payment successful</h2><p id="payment-result-message"></p><div id="payment-document-actions" hidden><div class="payment-document-links"><a class="btn secondary small" id="payment-invoice-download" download>Invoice PDF</a><a class="btn secondary small" id="payment-receipt-download" download>Receipt PDF</a><a class="btn secondary small" id="payment-view-receipt">View receipt</a></div><p id="payment-download-status" role="status"></p></div><div class="dialog-actions"><button class="btn primary" value="close">Done</button></div></form></dialog>
  <dialog id="send-dialog" aria-labelledby="send-title"><form method="dialog"><div class="dialog-symbol">↗</div><h2 id="send-title">Send this invoice?</h2><p>The branded HTML invoice will be emailed to <strong id="send-recipient"></strong>.</p><div class="notice">This is a <strong>test invoice</strong>. ${stripeTestReady() ? "The payment link opens Thrive4 Stripe test Checkout. Use test cards only. No real money is collected." : "The payment link is a localhost preview. Stripe is not connected."} Recurring payments are not active.</div><div id="send-error" class="form-error" role="alert" hidden></div><div class="dialog-actions"><button class="btn secondary" value="cancel">Cancel</button><button class="btn primary" id="confirm-send" type="button">Send invoice email <span>↗</span></button></div></form></dialog>
  <noscript><div class="noscript">Enable JavaScript to create and review local invoices.</div></noscript></body></html>`;
}
export function paymentPreviewShell(
  name: string,
  number: string,
  amount: string,
  description: string,
  expired: boolean,
) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment preview | Thrive4 Cleaning</title><link rel="stylesheet" href="/admin/invoices.css"></head><body class="admin-app payment-body"><main class="payment-preview"><img src="/brand/logo-primary.svg" width="160" alt="Thrive4 Cleaning"><span class="local-badge">LOCAL PAYMENT PREVIEW</span><div class="payment-symbol">${expired ? "⌛" : "↗"}</div><h1>${expired ? "This invoice has expired." : "Your invoice is ready."}</h1><p>Hi ${escapeHtml(name)}, this is the payment preview for invoice <strong>${escapeHtml(number)}</strong>.</p><div class="payment-total"><small>${escapeHtml(description)}</small><strong>AUD ${escapeHtml(amount)}</strong></div><div class="notice"><strong>${expired ? "Request an updated invoice." : "Stripe is not connected yet."}</strong><br>No payment can be collected here. Once Stripe is connected in a future update, Pay Now can open a secure Stripe checkout.</div><button class="btn primary" disabled>Payments unavailable</button><p class="payment-footnote">No card details are collected. No payment has been made. Autopay is not active.</p><a href="/admin/review" class="back-link">← Back to invoices</a></main></body></html>`;
}
