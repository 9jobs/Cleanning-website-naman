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

Success is returned only after Gmail accepts the message. This is an enquiry, not an appointment confirmation. Failed sends keep the form values and offer retry/direct email. Client request IDs and an in-process receipt cache prevent duplicate sends for repeated identical requests. Origin checks, payload limits, validation, a honeypot and a local process rate limit protect the endpoint.

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
