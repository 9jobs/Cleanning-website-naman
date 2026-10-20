# Layout and scaling audit

Local target: http://localhost:4317. No deployment, repository push, package change, asset replacement, or business-logic change.

## Findings

The supplied screenshots show a navbar approximately 335 screen pixels wide, matching the existing 1340 CSS-pixel navbar rendered at roughly 25% browser zoom. This is a strong indication of browser zoom-out, not a 335px mobile wrapper. During the live Chrome inspection the viewport was 1920 CSS pixels, outer window width 1920, devicePixelRatio 1, and both root/body CSS zoom were 1 with no transforms. The live tab was therefore already at normal scale. Chrome's Ctrl+0 resets a zoomed-out localhost tab. CSS should not counteract user browser zoom.

There were separate layout inconsistencies: custom `.container` widths coexisted with Tailwind container max-width breakpoints, and newer sections set independent widths. At 1280px, the plans container was 954px while standard sections were 1178px. At 1920px, hero/standard/about/plans/services content widths were 1370/1360/1480/1430/1747px. This prevented a common alignment. Some large-viewport typography rules scaled with the window even after the content reached its maximum width.

The UI is real HTML: cards, text, links, forms and navigation are individual DOM elements. The photographed assets are separate from the interactive UI. No flattened page screenshots were substituted. Reveal animations start at their intended entry transforms and settle to scale 1 with zero translation.

## Corrections

`src/app/layout-alignment.css`, imported last, defines an explicit 1360px content maximum and shared responsive gutters. The hero content, navbar, enquiry, introduction, plans, services, standard sections and footer use the same content edges. At 1440px the common width is approximately 1342px; at 1920px it is 1360px; at 390px it is 350px.

The plans and services sections size their desktop typography and grid rows against their actual content container, rather than inflating them under wide-window rules. Card minimum height follows content. Input flex/grid children can shrink within their columns. The homepage sticky navbar retains a consistent height on scroll.

No root zoom or compensating scale was added. No content, section order, image asset, colour, font family, card radius, shadow, gradient, link destination, or animation implementation was changed. Before/after DOM and computed-style identity comparisons verify the relevant approved properties.

## Verification

- `qa/layout-audit.mjs`: nine widths, 375–2560px, no page overflow or card text escaping its bounds, unchanged visual identity; before/after measurements and desktop/mobile screenshots.
- `qa/layout-pages.mjs`: 15 inner pages at six widths (90 responsive checks); all 15 homepage sections and every reveal wrapper verified at its final neutral animation matrix; individual section screenshots.
- `qa/flows.mjs`: 30 routes, 35 responsive checks, service filter, FAQ, pricing selection, booking handoff and validation, draft restoration, contact validation, keyboard and mobile navigation, image loading.

Reports: `qa/layout-before.json`, `qa/layout-after.json`, `qa/layout-pages.json`, `qa/report.json`. Screenshots: `qa/layout-before-*.png`, `qa/layout-after-*.png`, `qa/aligned-*.png`.
