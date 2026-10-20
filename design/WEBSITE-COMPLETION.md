# Completion inventory and protection map

Scope: existing Thrive4 Cleaning project, localhost:4317 only. No commits, deployment or production data changes.

## Existing routes

- `/`: approved photographic carousel, quote card, trust strip, approved company preview, approved plan comparison, service mosaic, lease feature, benefits, process, illustrative comparison, company story, experience, journal, FAQ and CTA.
- `/about`: approved complete page; locked.
- `/pricing`: approved plan cards, no displayed prices; locked.
- `/services`: existing hero + category filter for 11 services. Service-specific routes already exist for regular house, deep, end of lease, commercial, Airbnb, carpet, one-off, residential, office, window and oven cleaning.
- `/contact`, `/quote`: enquiry forms with configured backend handler; phone/email absent and hours provisional.
- `/book`: six-step validated request, service/query handoff, seven-day non-contact local draft, summary; no payments.
- `/areas`: search exists, coverage array is empty; no confirmed locations.
- `/reviews`: no verified testimonials; avoid empty filters and fictional review examples.
- `/faq`: searchable/category FAQs exist; editable body can be made clearer and more consistent.
- `/blog`: three original guides; featured article repeats in listing. Three `/blog/[slug]` routes exist with readable original text.
- `/careers`: expression of interest and PDF form exist; no published role/pay claims.
- `/privacy`, `/terms`: clearly marked draft business policies.
- `/book/confirmation`, `/quote/confirmation`: server-checked references; no fake confirmation without a database record.
- Loading, error, 404, sitemap and robots are present. No route creation needed before audit of internal links.

## Defects / completion work

1. Replace illustrative before/after with a labelled detail gallery; no genuine matched customer transformations are supplied.
2. Add practical coverage discovery to home, honest empty directory, and a postcode/suburb enquiry handoff.
3. Reuse genuine feedback only; polished invitation when none is configured, no meaningless filters.
4. Make service discovery readable with individual photographs and live text; add selection guidance.
5. Give 11 service bodies distinct audience, preparation, process and FAQs; preserve every existing service hero.
6. Clarify actual request process (preferred date is not confirmed); no automatic booking claims.
7. Complete editable contact/quote, booking, FAQ, journal/article and careers bodies with purposeful layouts and scoped focus/validation styles.
8. Use existing Reveal component with local 28px / 0.55s settings; do not modify shared motion.

## Locked dependency files

`home-carousel.tsx`, `hero-enquiry.tsx`, `inner-pages.tsx` (About and all InnerHero variants), `pricing-plans.tsx`, `showcase.tsx` (PricingPaths and company ScrollStory), `interactive.tsx` (Pricing calculator), `forms.tsx` (shared with hero), `ui.tsx` (About/shared CTA), `motion.tsx`, `layout.tsx` (header/footer), `config.ts`, `data.ts` and all existing CSS files.

Homepage block from HomeHero through the end of reference-packages remains byte-identical. Company ScrollStory remains unchanged. About/Pricing branches and existing hero markup remain unchanged. New CSS is confined to completion component classes below existing heroes. Root layout may only import that new stylesheet.

## Baseline

`qa/completion/before.json`: 26 SHA256 protection records; 24 desktop/mobile screenshots and geometry/copy records at 390 and 1440 pixels. Baseline normal CSS/browser scale, reduced motion, settled fonts. Retest identical viewport, section and screenshot state after changes.

## Integration state

Forms POST to `/api/submissions`; Zod validation and origin checks are already implemented. `submissionsReady()` requires enabled submissions plus Supabase URL/service key. Resend optionally sends reference notifications. No configured integration will be enabled by this task. Coverage, testimonials, phone/email/ABN, final hours, approved rates and business policies need business input before launch. Existing pricing data/calculations are outside scope.
