# Lumo redesign: wiring guide for v0

These files are final. Copy them in exactly. Do not restyle, refactor, or rewrite them.

## Files
- app/lumo.css: import once in app/layout.tsx with `import "./lumo.css";`
- app/page.tsx: replaces the current landing page
- components/lumo/ui.tsx: shared header, path bar, signature, reveal helpers
- components/lumo/landing.tsx: the landing page
- components/lumo/screens.tsx: every /app screen, presentational only

## Fonts (app/layout.tsx)
Load with next/font/google and put all three variable classes on <body>:
- Inter, weights 400 500 600 700, variable "--font-inter"
- JetBrains_Mono, weights 400 500, variable "--font-jetbrains"
- Source_Serif_4, style italic, weight 400, variable "--font-serif"

## /app wiring
Keep the existing state machine, API calls, and localStorage logic. Replace only the JSX for each view with the matching component and pass real data:

| View | Component | Data source |
|---|---|---|
| Home | HomeScreen | input state, past decisions from localStorage |
| Step 1 | Step1Screen | situation text, submit calls /api/analyze |
| Step 2 | Step2Screen | analyze result mapped to ReadBack, i_noticed to `noticed` |
| Step 3 | Step3Screen | options with `source` "user" or "lumo" |
| Step 4 | Step4Screen | comparison fields per option |
| Step 5 | Step5Screen | selection, why, gave up, confidence; onCommit saves to localStorage |
| Step 6 | Step6Screen | drafts from /api/decide, rewrites from /api/rewrite |
| Completion | CompleteScreen | the saved decision |

`aiStatus`: "ok" after the last API call succeeded, "error" after it failed, "idle" before any call.
`decisionNumber`: next sequential number from localStorage, starting at 1.
If an API response is missing a field a component needs (i_noticed, source, cost_level, reversible, and so on), add it to that route's tool schema. Do not remove fields from components.
Keep the diagnostic panel: render it below the component when a call fails.
