# cleannora.co — current design handoff

The latest user direction changes the brand from Clearora Cleaning Co. to **cleannora.co**, using the supplied Maid to Clean website as the visual reference. The running code is the current design source. The original SVG exports in this folder document the earlier Clearora version and are retained as reference assets; they are not the current branded design.

## Current page compositions

- Dark charcoal sticky navigation, green booking buttons, original C/sparkle mark and cleannora.co wordmark.
- Full-width lifestyle hero with original AI-generated cleaning photography, a dark green overlay, centred white heading and a prominent quote starter.
- Quote starter collects contact details in React memory and passes them into the existing validated enquiry form. It does not save personal data to browser storage or report a submission before the server receives it.
- Introductory team section followed by regular, one-off and end-of-lease plan cards. No competitor prices, ratings, names, guarantees or business history are reproduced.
- Editorial service mosaic, moving-out feature, varied benefits, scroll-linked three-step journey and a dark photographic story section.
- Kitchen, bathroom and living-room comparisons use corresponding halves of AI-generated scenes. They are labelled as illustrative demos rather than customer outcomes.
- Experience carousel uses clearly labelled concept copy until verified reviews are configured. No invented reviewer identity or rating is displayed.
- Inner pages use distinct editorial image heroes, dark pricing hero, simple booking/FAQ/location heroes and restrained legal layouts.
- All booking, pricing, area search, contact, careers, journal and service routes retain the existing data flow.

## Foundations

Main reference-inspired colours: charcoal #2D3339, green #1AA562, deep green #294B38, off-white #F7FBFC, muted green text #657770. Manrope headings and Inter body text remain locally hosted. Container maximum 1360px; margins scale from 64px desktop to 22px mobile. Section spacing 112px desktop, 88px tablet and 68px mobile. Main headings 44–68px, section headings 36–56px, body text 15–17px, utility labels 10–13px.

CSS is layered in `globals.css` (functional base), `redesign.css` (shared premium system) and `reference.css` (latest green/charcoal reference direction).

## Motion and interaction

`Reveal` uses Motion's imperative animation controls plus one IntersectionObserver per wrapper. It accepts direction, distance, duration, delay, child stagger, threshold and once/repeat behaviour. Default travel is 60px and duration 800ms. Variants include upward/downward/sideways fades, scale, blur and image masks. Content is visible during server rendering; client preparation, animation completion, reduced-motion changes and a completion watchdog protect against invisible content. Effects restart after client navigation and clean up on unmount.

Motion values drive the scroll progress, desktop timeline and selected image parallax without per-frame React state updates. No GSAP dependency was required. Hover effects use transform and restrained shadows. Reduced-motion mode removes nonessential movement. Normal browser scrolling is preserved.

## Assets and truth

`cleannora-hero.png` and the three `comparison-*-demo.png` images are AI-generated illustrative assets. Earlier photos come from the user-supplied Figma design. Brand wordmarks are in `public/brand/`; `src/app/icon.svg` remains the original C/sparkle identity mark. The browser-only draft key keeps its original name for compatibility with saved booking plans.

The previous remote Figma write attempt was blocked by the account's Starter-plan MCP allowance. No remote Figma redesign is claimed. Current browser screenshots and QA reports are saved under `qa/redesign-*`.
