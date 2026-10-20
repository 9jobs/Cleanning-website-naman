# Responsive header and hero correction

The old homepage placed a cover photo, copy, floating cards and overlapping enquiry form in a fixed-height banner. Cover cropping removed parts of the cleaner's head, and translucent gradients reduced image clarity. On mobile, text occupied the same area as the person in the photograph.

The new HomeHero component uses a natural grid: editorial copy beside a full 3:2 photograph on desktop, and stacked copy and photograph on tablet and mobile. The original photo remains sharp with object-fit: contain and no filter. The service caption sits below the photograph. The quote card follows the hero in document flow without a negative margin. Decorative floating cards, the review preview and the white curve are removed from this hero.

Navigation is a white sticky bar in document flow, consistently styled across the site. At 1150px and below, links move into an accessible, scrollable mobile menu. Escape closes it and restores focus to the toggle. Expanding to desktop closes the mobile menu. The fixed bottom booking button is removed to avoid covering content; booking remains available in the header and page calls to action.

The page's existing lower sections and working forms remain intact. Full people photographs are also preserved in the inner-page image containers.

## Latest carousel revision

The latest user direction replaces the split hero with a full-width photographic carousel in `src/components/home-carousel.tsx` and `src/app/carousel-hero.css`. Three slides crossfade in a six-second loop with arrows, direct slide selectors and pause/play. Hover and keyboard focus pause rotation; reduced-motion preference pauses autoplay unless the visitor starts it. The photo begins below the homepage's inset dark navigation so the male cleaner's head remains clear of the navbar. Mobile retains separate copy and a full uncropped photograph.

The About hero's “Cleaner homes” floating card was removed. The other two cards keep explicit placement and are hidden on narrow screens.

`qa/carousel.mjs` verifies the automatic 1 → 2 → 3 → 1 loop, pause, arrows, selectors, 13 responsive widths and removal of the About card. `qa/carousel-report.json` records the results. The production build passes locally.

Verification: qa/hero-responsive.mjs measures navbar, hero copy, image and quote-card geometry at 16 widths from 320px to 2560px, tests 11 mobile menu widths and a short landscape viewport. qa/thrive.mjs checks inner pages and supports --edges for additional 320px, 1024px and 1920px checks. qa/flows.mjs verifies existing routes, filters, quote handoff, six-step booking validation, menu keyboard behavior and mobile navigation. Builds run locally with no deployment.

## Cover-banner refinement — 20 October 2026

Replaced the first carousel photo with an original panoramic cleaning scene (`thrive-banner-home.png`) so the cleaner's face and hands fit the wide banner. The home navigation now floats over the photograph on desktop. Replaced the broad opaque wash with a local, translucent radial wash behind the copy and restored the overlapping quote card and curved photograph edge.

Removed visible hero arrows, dots, counter and pause icon. There is no handwritten slogan. Slides continue every six seconds while the pointer is over the banner, with an accessible pause/start button revealed on keyboard focus. Reduced-motion preferences are respected using a hydration-safe media subscription. Mobile keeps readable copy above a focused photograph, with no text over the cleaner.

Validation: `npm run typecheck`; `qa/banner-reference.mjs` checks a complete autoplay loop under hover, absent hero controls, ten viewport widths, quote/caption spacing, reduced motion, and browser errors. Screenshots: `qa/banner-ref-1920.png`, `qa/banner-ref-1440.png`, `qa/banner-ref-1024.png`, `qa/banner-ref-390.png`.
