# Thrive4 invoice admin

The localhost workspace uses ignored local files by default. Production is explicitly enabled with THRIVE4_ADMIN_ONLINE=true and an isolated THRIVE4_ADMIN_DATABASE_URL. The production host must match NEXT_PUBLIC_SITE_URL (HTTPS) or the current Vercel deployment URL.

## Authentication and storage

Only THRIVE4_ADMIN_EMAIL and the salted scrypt THRIVE4_ADMIN_PASSWORD_HASH configured on the server can sign in. No credentials are embedded in code. Opaque session tokens are stored hashed, expire after eight hours, and are revoked on logout. Production sessions and login attempt limits use private PostgreSQL tables across function instances. Cookies are HttpOnly, Secure in production, and SameSite=Lax. Writes require a matching HTTPS Origin. Admin pages, invoice actions, and invoice-ID PDF endpoints require a valid session.

Production invoices and revision history live in the private thrive4_admin schema. A restricted runtime role has only the required table permissions, with RLS enabled and no public/anonymous access. Updates lock the workspace row within a transaction; stale revisions are rejected. Edited/deleted local test records are archived first. Open unpaid checkouts are expired before mutation; missing test sessions do not prevent local record management. Completed Stripe charges are never modified or refunded by editing/deleting a record.

## Provisioning

Run scripts/migrate-admin.mjs with the existing site's local migration credential, then scripts/import-admin.mjs once to migrate an empty workspace. Migration creates only the dedicated admin schema and runtime role. Do not deploy the database administrator credential. Configure server-only production values through scripts/configure-vercel-admin.mjs; it checks the exact Thrive4 Vercel project and transfers values via stdin without logging them. All environment files and local data are excluded from Git and deployment upload.

## Payments and email

Only the dedicated Thrive4 sandbox key is used. Every Stripe operation verifies the pinned Thrive4 account; live keys and connected-account routing are refused. Pricing is AUD 70 per person-hour with server-owned amounts. Historical AUD 60 receipts remain readable. Deep Cleaning is unavailable for new bookings/checkouts. Payments are one-time test payments; no real money, subscriptions, automatic scheduling or fulfillment is enabled.

Online invoice Checkout returns to a public payment confirmation using an unguessable Checkout reference. Receipt/PDF access verifies the account, completed payment, saved invoice revision, currency and exact amount. The query string alone cannot confirm a payment. Payment status is reconciled on reads; there is no fulfillment webhook. Email uses server-only SMTP configuration and a hosted HTTPS logo, without image attachments. SMTP acceptance is distinct from inbox delivery.

## Checks

Run npm test, npm run typecheck, npm run lint and npm run build. qa/admin-online-check.ts verifies the restricted role, persistent login/logout, invoice CRUD, revision conflicts and history against a temporary database record; it sends no emails or payments. Live release checks must cover login enforcement, credentials absent from client assets, saved invoices, pricing, and payment document endpoints. Browser auto-downloads may need permission; manual PDF buttons remain available.
