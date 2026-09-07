# aurora-v1 (archived 2026-09-07)

First attempt at the portfolio redesign: a dark, "Apple-esque," aurora-gradient
single-page site. Archived, not deleted — several components are worth reusing in
the next version.

Audit that prompted the pivot: `docs/superpowers/specs/2026-09-07-portfolio-audit.md`
Original spec/plan: `docs/superpowers/specs/2026-09-06-portfolio-redesign-design.md`,
`docs/superpowers/plans/2026-09-06-portfolio-redesign.md`

## Worth reusing (in `assets/js/main.js`)
- **`initHealViz`** — scattered points resolving into an aligned grid, scroll-scrubbed.
  The one animation whose behavior encodes meaning ("messy data -> clean systems").
  Strong candidate for a centerpiece in v2.
- **`initMapJourney`** — SVG dot travels a path across a North America map, lighting
  up Toronto / Austin / NYC landmarks. Geography is real lat/long.
- **`initRouteViz`** — hub-and-spoke packet routing animation (the ROC diagram).
- **`initSkillConstellation`** — canvas force-graph of skills (needs a real
  adjacency list if reused).
- **`initChatDemo` / `initCrisisChatDemo`** — looping typewriter chat mockups for
  the project cards.
- **Terminal boot sequence** (`runBootSequence`) and the click-to-open terminal
  modal — the seed of the terminal-resume idea, to be expanded in v2.

## Known issues (see audit)
Chat-demo `setInterval` leak, skills list trapped in an `aria-hidden` canvas,
stat counters re-firing, no favicon / Open Graph, several content/date errors.
Fix these properly in v2 rather than porting them forward.
