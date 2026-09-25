# Lumo rules

## Rules

- Do not break the working AI setup: `/api/analyze` and `/api/decide`, the shared model constant in `lib/anthropic-model.ts`, forced tool calls, the output cleanup function, the retry, and the `SHOW_DEBUG_PANEL` diagnostic panel.
- Do not break localStorage persistence of past decisions.
- Colors: canvas `#FAF7F0`, surface `#FFFFFF`, muted `#F2EDE2`, dark `#1F1B17`, text `#1F1B17` / `#5C5751` / `#8C8780`, border `#E5DECF`, persimmon `#E26847` (hover `#C95637`, pressed `#B14A2E`, soft `#F9DDD2`), positive `#4A7A5C`, caution `#C49144`, risk `#A04A38`.
- Fonts via `next/font/google`: Inter 400/500/600/700 for UI, JetBrains Mono 400/500 for numbers, dates, status and decision numbers, Source Serif 4 Italic 400 for the signature line only.
- Signature line: Source Serif 4 Italic 17px, secondary color, 2px persimmon left border, 14px left padding. Used ONLY in four places: the closure quote on past decision cards, the “I noticed” line on Step 2, the Home empty state, and the completion screen closing line. No other left borders anywhere.
- App content max width 720px, centered. Cards: white, 1px border, 10px radius. Primary button: persimmon, cream text, 8px radius.
- Copy: no em dashes, no exclamation points, no “let’s” or “we’ll”.
- Motion: 200 to 900ms, ease-out, no bounce, no parallax, no scroll hijacking. Every animation respects `prefers-reduced-motion`. Everything works at 375px.
- No fake data presented as real. Demo content must be labeled as an example.

## Landing page

Rebuild `/` to match the supplied design reference, with: navigation to section anchors and `/app`; two-column hero with the exact headline, CTAs, detail line, and an explicitly labeled example product panel that fades through raw input, read-back, and audience-message states every 12 seconds; a 40-second linear dilemma ticker; numbered problem cards; a dark audience artifact section with a staggered IntersectionObserver reveal; clickable six-step preview; a two-mode comparison; an example engineering message; a persimmon CTA band; and the dark footer with the Lumo tagline and Terrance Range credit. Use IntersectionObserver for scroll reveals and no new animation dependency.

## Decision flow

Preserve and extend the existing implementation of `/app` and its APIs, rather than replacing them. The shared header shows AI availability from the latest API result. Home accepts and pre-fills a real decision title, cycles its placeholder until typing starts, and displays prior decisions persisted in localStorage with real sequential numbers beginning at No.1.

Steps 1 through 6 share the numbered path bar. Step 1 highlights detected entities behind the editable textarea, displays actual counts, and invokes `/api/analyze`. Step 2 shows an honest loading state, reveals editable real analysis fields one at a time, and reveals the “I noticed” signature last. Step 3 presents AI options, marks their `source` as `user` or `lumo`, always includes at least one Lumo proposal, and allows adding a user option. Step 4 presents an AI comparison for each option, including cost level/summary, affected parties, reversibility, and risk, with responsive stacked mobile cards. Step 5 allows a choice, rationale, trade-off, confidence from 1 to 5, and a hold-to-commit interaction with an accessible instant alternative. Committing persists the decision and continues to Step 6.

Keep the existing `/api/analyze` and `/api/decide` handlers, shared model constant, forced tool calls, cleanup, retry, and `SHOW_DEBUG_PANEL` diagnostic panel intact and functional on every AI call. Use actual API responses and user input for flow data; never present invented content as real.
