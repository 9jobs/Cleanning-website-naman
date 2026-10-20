# Contact quote form and Gmail delivery

The `/contact` page now uses a separate responsive two-column quote form. It retains the shared Thrive4 navigation/footer and does not change Home, About, Pricing, `/quote`, or the existing booking form.

## Implementation

- UI: `src/components/contact-quote.tsx` and `src/app/contact-quote.css`.
- Validation: `src/lib/contact-validation.ts`, shared by browser and server.
- Dedicated handler: `POST /api/contact` in `src/app/api/contact/route.ts`.
- Server mail transport: `src/lib/contact-mail.ts`, using authenticated Gmail SMTP over TLS on port 465.
- Server-only configuration: `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD`, `CONTACT_TO_EMAIL` in ignored `.env.local`. The example file contains blank keys only. Never put credentials in a NEXT_PUBLIC variable.
- The configured recipient is Thrive4cleaning@gmail.com. Enquiry email includes customer contact details, selected service, property/location, room counts or commercial floor area, frequency, optional date and additional requirements. Reply-To is the customer's validated email.

## Delivery behaviour

The handler now commits each enquiry to `public.contact_enquiries` before contacting Gmail. It stores customer fields, consent, timestamps, notification attempts/status and the SMTP message ID. Apply `supabase/migrations/002_contact_enquiries.sql` using `scripts/migrate-contact.mjs`. Only server-side PostgreSQL access is enabled; anonymous and authenticated public API roles have no table access and RLS is enabled.

Success is returned after Gmail accepts the message. This is an enquiry, not an appointment confirmation. Failed sends retain the saved record with `notification_status=failed`, keep form values and allow retry with the same request ID. PostgreSQL request IDs, transaction locks, notification leases and sent receipts replace process-memory deduplication. Rate limits are database-backed and use HMAC-hashed client addresses. An SMTP acceptance followed by process termination is an inherently ambiguous external delivery; exactly-once email delivery cannot be guaranteed across that failure boundary. No scheduled retry worker is configured: failed notification rows can be reviewed in the dashboard and the same form request can be retried.

Configure `CONTACT_DATABASE_URL` and a random `CONTACT_RATE_LIMIT_SECRET` as server-only variables alongside the existing SMTP variables. The root CA in `certificates/supabase-root.crt` is public, downloaded from Supabase's official `https://supabase-downloads.s3.amazonaws.com/prod/ssl/prod-ca-2021.crt`; TLS verification stays enabled. Admin migration credentials remain local and are excluded from Git and Vercel uploads.

This dedicated contact-email flow does not enable the Supabase-based `/api/submissions` booking, quote or careers handlers. Those retain their existing configuration and development state.

## Verification actually performed

- Gmail SMTP authentication verified successfully.
- Exactly one clearly labelled website delivery-test email sent through the browser form and accepted by Gmail. No customer booking created. Inbox placement was not inspected.
- Identical request replay returned the same reference without sending a second email.
- Form validation, room counters, residential/commercial switch, service/location query prefill, malformed payload rejection and cross-origin rejection checked.
- Simulated failed send/loading state retains values and never shows fake success. This test sends no actual email.
- Password absent from rendered contact HTML and loaded browser JavaScript; environment-file URL renders the site's not-found page.
- Eight viewport widths checked: 375, 390, 430, 768, 1024, 1280, 1440, 1920; no horizontal overflow.
- TypeScript, targeted ESLint and production build passed.
- Locked Home/About/Pricing comparison: protected source hashes and 24 desktop/mobile captures match baseline, with zero pixel differences.

Reports: `qa/contact-email-report.json`, `qa/contact-negative-report.json`, `qa/completion/regression.json`. Screenshots: `qa/contact-quote-1440.png`, `qa/contact-quote-390.png`, `qa/contact-email-success.png`.

## Supabase and production verification — 20 October 2026

- Database migration applied with full CA/hostname TLS verification; both new tables have RLS enabled and public roles cannot select or insert enquiries.
- Local production-build test and live Vercel test each sent one clearly labelled test enquiry. Each produced one matching database row and one accepted Gmail notification, with `notification_attempts=1`; repeated identical requests returned the existing receipt.
- Conflicting payloads under an existing request ID were rejected with HTTP 409 without overwriting the enquiry.
- TypeScript, targeted lint, eight validation tests and production build passed. Protected Home/About/Pricing/navigation source files remain unchanged.
- Hosting uses only the new `thrive4-cleaning` project. Server credentials are encrypted production environment variables; `.env.local` and `.vercel` are excluded from Git and deployment uploads. Secret scanning of source candidates found no credentials.
- Live URL: https://thrive4-cleaning.vercel.app. Dashboard records: Supabase Table Editor → `public.contact_enquiries`; successful email status is `sent`.
