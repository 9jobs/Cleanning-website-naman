# Thrive4 Cleaning

Responsive cleaning-services website built with Next.js App Router, React and TypeScript. Includes the homepage, Who We Are, pricing plans, eleven service pages, cleaning guides, FAQ, coverage enquiries, careers and a multi-step booking request flow.

## Run locally

Use Node.js 20.9 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev -- --port 4317
```

Open http://localhost:4317. On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if preferred.

## Contact enquiry email

The dedicated `/contact` page submits to `/api/contact` and sends enquiries through Gmail SMTP. Configure these **server-only** variables in your own ignored `.env.local` or hosting environment:

- `CONTACT_SMTP_USER`: Gmail sender account.
- `CONTACT_SMTP_PASSWORD`: the sender's Gmail app password.
- `CONTACT_TO_EMAIL`: business inbox receiving enquiries.

No password or live environment file is stored in this repository. A fresh clone needs its own environment configuration before email will work. The form validates input, prevents repeat delivery for identical request IDs, and shows success only after the mail server accepts the enquiry. Preferred dates are enquiries, not confirmed appointments.

See `design/CONTACT-EMAIL.md` for the implementation and validation notes.

## Booking, quote and careers submissions

These existing forms use the separate `/api/submissions` handler. To enable them, configure Supabase, apply `supabase/migrations/001_submissions.sql`, and set `SUBMISSIONS_ENABLED=true` after the required business details and policies are approved. Optional Resend notifications use `RESEND_API_KEY`, `NOTIFICATION_FROM` and `NOTIFICATION_TO`.

Without that configuration, those flows clearly report that submissions are not connected. The Gmail contact form does not enable the database-backed booking, quote or careers flows. No payments are collected.

## Content and assets

- `src/lib/config.ts`: business configuration, navigation, coverage and approved pricing settings.
- `src/lib/data.ts`: services, FAQ and cleaning articles.
- `src/lib/completion-content.ts`: service-specific guidance.
- `public/images/`, `public/fonts/`, `public/brand/`: local image, font and brand assets.
- `src/components/`: page sections, forms and interactions.
- `design/`: implementation notes and earlier design references. The running website is the current source of truth.

Home, About and Pricing retain their approved layouts. Prices are currently hidden from the pricing cards. Coverage and reviews use configured data; unconfirmed locations and missing testimonials are not represented as verified business information. Legal pages remain marked as drafts pending business review.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start -- --port 4317
```

Browser QA scripts are in `qa/` and use the installed Chrome executable on Windows. Adjust the executable path on other machines. Generated screenshots and reports are intentionally excluded from Git.

`qa/contact-email.mjs` sends one real, clearly labelled test enquiry to the configured recipient. Run it only when you intend to send that email. Other layout/negative tests do not send real email.

The website remains local until you explicitly deploy it. Configure server environment variables separately on any future host; do not upload `.env.local`.
