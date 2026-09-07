# Portfolio audit — `new-and-improved` branch (2026-09-07)

Four parallel audit agents reviewed the current build against the user's brief:
"a very unique experience rather than just an AI generated portfolio... something
that feels like my personality and mirrors my work and my roles."

Lenses: visual distinctiveness, voice/personality, engineering quality, motion cohesion.

## Headline

The build is not the failure. Agent 3 called it "thoughtfully built"; the module
pattern, observer gating, DPR capping, and reduced-motion wiring are mostly sound.
The failure is upstream: the design spec asked for "dark, cinematic, Apple-esque,"
and the build faithfully executed a brief that guaranteed the "AI-generated" result
the user is now reacting to.

Scores from the agents:
- Visual: 8/10 "reads as AI-generated"
- Voice: 4/10 "feels like a real person"
- Motion cohesion: 4/10 "a pile, not a system"
- Engineering: solid, one real bug class, some always-on cost, a11y/meta gaps

The next phase revises `2026-09-06-portfolio-redesign-design.md`, it does not patch
`main.js`.

---

## Pile 1 — Spec-level (needs a direction decision before any code)

### The "AI-generated" tells, ranked
1. **Apple.com fingerprint is literal.** `--ink:#1d1d1f`, `--mist:#f5f5f7`,
   `--slate:#6e6e73`, `--line:#d2d2d7`, `--accent:#0071e3` are Apple's exact
   marketing tokens. `.nav.scrolled` = Apple's exact `saturate(180%) blur(20px)`.
   `.btn` `border-radius:980px` is Apple's literal magic number. Clocked in under
   a second.
2. **No typographic point of view.** Every heading weight 700, negative tracking,
   line-height ~1.0, `clamp()` sizing. No serif, no structural mono, no distinctive
   numerals despite three sections wanting tabular figures.
3. **Gradient-text name** (`linear-gradient(180deg,#fff,#c9cfdb)` clipped to the
   `clamp(3.2rem,12vw,8rem)` H1) is a top-three template tell on the most prominent
   element.
4. **Aurora blobs** — three `blur(70px)` drifting radial gradients, blue/purple/teal,
   `mix-blend-mode:screen` — the definitive "generated hero" background of 2023–25.
5. **Uniform blur-up reveal** (`translateY(30px) + blur(10px)`) on ~20 blocks — the
   framer-motion/AOS default, same gesture for a headline and a legal footer.
6. **4-up count-up stat grid** on a dark gradient — stock template block; the
   count-up-on-scroll is itself a tell.
7. **Skill constellation** — labelled dots on proximity-only edges encode nothing;
   the single most common skills viz on developer portfolios.

### The signature that's already in the repo, underused
`initHealViz` (scattered points resolving into an aligned grid) is the only motion
on the page whose *behavior encodes meaning* — it literally is "dependable systems
out of messy real-world data" and the Provider Directory's self-healing
reconciliation. It's rendered as a thumbnail in the narrow column of a flag row.
Both the visual and motion agents independently nominated promoting it to the
centerpiece.

### The personality is generic and borrowed
- Terminal boot: `cat personality.md` -> "builds fast, pairs with AI agents,
  obsesses over clean systems"; `echo $MOOD` -> "caffeinated, mid-deploy, probably
  fine". Developer-cliche starter pack. Nothing true of Samuel specifically.
- The click-the-name terminal popup replays 2 of 3 lines verbatim from the boot.
- "dependable" appears 3x in visible copy + meta; "systems" 5x. Reads as SEO.
- Outside two sentences ("I mapped an ambiguous source landscape no one had
  tackled, then designed the system end to end" is the best line on the page) the
  narrator collapses into LinkedIn headline-ese: "A progression through systems
  work", "Increasingly high-impact backend and data systems across five
  engineering orgs".
- **No About / origin / opinion / why-healthcare / outside-work anywhere.** The
  nav (Now / Work / Projects / Contact) has no home for it.
- The single most differentiating true fact — Samuel introduced Claude Code +
  Superpowers at ExaCare and presented it company-wide at Town Hall and Eng Week
  — is buried as bullet 4 of 4 under "Across the team." The spec's stated goal is
  a site that "reads as the work of an AI-driven software engineer"; this is the
  real, rare, verifiable version of that claim and it's hidden.

### Motion is not a system
- One easing token (`--ease`) used in 3 rules; ~13 distinct CSS durations, ~7 JS
  durations, 3 separate ideas of "ease-out", constant-velocity JS animations
  beside cubic-out ones. No shared timing scale, no conceptual through-line.
- Four forever-loops (map journey, constellation, both chat demos) + 3 aurora
  fields mean any scroll position has 2–3 things moving, none responding to the
  user, none carrying new information after first view.
- **The hero handoff has no handoff.** One 500ms `setTimeout` adds `.boot-done`,
  which simultaneously fades the terminal (0.6s) and cascades the name in (1s w/
  delays). Because `.hero-stack > *` share `grid-area:1/1`, the dissolving
  terminal and the emerging name cross-fade through each other for ~600ms. The
  spec called this "the single most important beat" and "never shown in motion."
- **~4.3s from load to a settled hero, ~3.4s until the name is readable, no skip.**

### Open questions the direction must answer
- Palette + type system: what replaces the Apple tokens? (signal-green-forward,
  fully dark, display face + structural mono is the agents' consensus)
- Fully dark end to end, or keep the light `.band` sections?
- Promote heal-viz to full-bleed hero centerpiece? Make it interactive (drag to
  scatter, watch it self-heal)?
- Keep the terminal as a persistent docked element instead of a 4s intro that
  self-destructs?
- Constellation: give it a real adjacency list, or replace it?
- Add an "Approach" section (+ nav entry) with first-person voice, origin,
  one unhedged opinion?
- Make the Claude Code / Superpowers story load-bearing in the hero or Approach?
- **IA vs audience:** Samuel is job-searching. A recruiter gives this ~40s. Does a
  scroll-gated cinematic hero with no skip serve the primary reader?

---

## Pile 2 — Direction-independent defects (fix regardless of direction)

- **[High] Chat-demo `setInterval` leak** (`main.js:337-360`, `:364-399`). IO exit
  only `clearTimeout(timer)`; the typewriter `iv` interval is unreachable and
  never cleared. Each scroll round-trip *doubles* the number of concurrent loops,
  all writing the same node -> garbled text, flickering crisis flag. Reproducible.
- **[High] Skills list exists only inside an `aria-hidden` canvas.** 21
  technologies (recruiter search terms) invisible to screen readers, Googlebot,
  ATS. Put a real `<ul>` in the DOM; keep canvas decorative.
- **[Med] `initStatCounts` re-fires on every re-intersection** (`main.js:227-230`)
  — numbers snap to 0 and re-count on scroll-back. Add `unobserve` / done-flag.
- **[Med] Map journey never replays its city reveal on second view**
  (`main.js:187-189`, `:205-206`) — `resetLights()` never runs on re-entry;
  contradicts commit `a45c50b`. Call `resetLights()` in the IO enter branch.
- **[Med] healViz loses its resize handler under reduced motion** (`main.js:98`
  returns before `:103`) — stale/stretched canvas after resize. Register resize
  before the reduce-return like the other two viz do.
- **[Med] Both chat demos keep looping under `prefers-reduced-motion`** — bubble
  flips between "..." and a paragraph every ~3.2s forever, crisis flag re-reveals
  on a loop. Should render one static resolved state.
- **[Med] Aurora is the dominant perf cost.** 6 large (48–60vmax) permanently
  layer-promoted `blur(70px)` elements (hero + contact), infinite animation.
  Sustained GPU / battery load on mid-range phones. Drop `will-change`, cut blur
  to ~40–50px, reduce to 2 blobs, and/or pause off-screen.
- **[Med] `initMagneticButton`** adds a `document` `mousemove` for page lifetime,
  `getBoundingClientRect()` every move, even with the hero off-screen. Gate on
  hero visibility + coarse-pointer; rAF-batch.
- **[Med] `initHealViz`** has no IO gate; `kick` -> `getBoundingClientRect()` on
  every scroll event for the page lifetime. Gate like the other three viz.
- **[Med] Terminal modal has no focus management** — focus not moved in, not
  restored, background not `inert`, Tab escapes behind the overlay. `#heroName`
  trigger is a mouse-only `<h1>` (no keyboard).
- **[Med] No favicon** — `/favicon.ico` 404 on every load, default globe in the
  tab.
- **[Med] No Open Graph / Twitter Card** — bare imageless unfurl on LinkedIn,
  Slack, iMessage, where a job-search site is actually shared.
- **[Med] No `<noscript>` fallback** — every `.reveal` and `.h-anim` is
  `opacity:0` until JS; JS disabled/blocked = blank page below the nav.
- **[Med] Accent-blue text fails WCAG AA** — `#0071e3` on `#f5f5f7` = 4.31:1,
  affects `.kicker` and `.flag-role` in every band section. `.map-years`
  `#4a5568` on `#0e1626` = 2.4:1.
- **[Med] Mobile:** constellation (340px tall, 21 nodes) and map `<text>`
  (6.5–9.5px) are unreadable at small sizes, and are the only home of their
  content.
- **[Low] Whole-IIFE fragility** — `onScroll()` runs synchronously at load with no
  null guard; any throw there blanks the above-the-fold hero. No `try/catch`.
- **[Low]** Map dot moves at constant velocity and teleports NYC->Toronto on loop
  restart. Terminal modal hard-cuts in with no transition. `playing` flag can
  wedge the easter egg for seconds after Escape.
- **[Low] Dead code:** `body.is-ready` (no CSS rule), `.boot-cursor` (never
  inserted). Duplicated boot-lines array. Three separately-implemented
  typewriters. Near-duplicated chat-demo functions (~90% identical).
- **[Low]** No `<meta name="color-scheme">` / `theme-color`, no canonical, no
  `schema.org/Person` JSON-LD, no skip link.

---

## Pile 3 — Content accuracy (green-light in one line, do not lose in the design debate)

- **Inter is loaded but never renders.** `index.html:8-10` loads it with a
  preconnect; `style.css:5` puts it *fifth* in the stack behind `-apple-system`
  and SF Pro. On Apple browsers the Google Fonts request paints nothing. Either
  commit to a real chosen face and put it first, or drop the load.
- **Apple dates asserted as "2023 – 2026"** in `index.html:198` and the map
  (`mapAusYr`). Resume says "Sept 2023 – Present". The spec explicitly said treat
  the 2026 end as approximate, "not a hard claim." Already-shipped spec violation.
- **Internal date contradiction:** map Toronto reads "2019 – 2023"
  (`index.html:129`); education reads "2019 – 2024" (`index.html:349`) for the
  same TMU period.
- **Constellation data errors:** `Solr` is binned `cat:'ai'` (`main.js:250`) — it's
  a search engine. **Kotlin is missing** despite being the language behind the
  "2B+ records per hour" Amazon work.
- **"fine-tuned RoBERTa"** (`index.html:321`) — resume says only "Implemented a
  RoBERTa model." Drop "fine-tuned" unless confirmed.
- **"across five engineering orgs"** (`index.html:182`) — five roles at four
  companies (ExaCare, Apple, Amazon x2, AMD).
- **Stats grid picks the wrong four numbers** — counts 80% / 95% / 70k/hr / 42%;
  omits **2B+ records per hour**, the most impressive figure on the resume (it's
  in the experience row but not the section literally titled "Measured impact").
- Second project card ships tech line "More on this soon." — reads as unfinished.
- Spec's monochrome company marks (Apple/Amazon/AMD/ExaCare) never shipped;
  orphaned `.xp-co` `display:flex;gap:12px` left behind from the removed badges.
- ROC card diagram is a generic 6-node even hub-and-spoke, not the "three
  facilities routing through a hub to a recipient" the spec described.

---

## Agents' three "bold swings" (in tension on ordering, not merged)

1. **Visual agent:** reskin *first*. Kill the Apple tokens, the `980px` pills, the
   system-font stack; go fully dark end to end; set every piece of metadata in a
   mono against a display face with real character. A viewer identifies "Apple
   clone" in under a second — bolting a new viz onto that skin still reads as a
   template. Then promote heal-viz to full-bleed.
2. **Motion agent:** build the centerpiece *first*. Heal-viz becomes the hero:
   scattered points resolve into the "SAMUEL HABIB" wordmark as you scroll; drag
   across the settled name to scatter it and watch it self-heal (the self-healing
   pipeline made tactile). Replaces the typed-terminal hero, kills the 4.3s gate
   and the muddy handoff in one move.
3. **Voice agent:** lead with *content*. Make the Claude Code / Superpowers story
   load-bearing in Samuel's identity — one sentence in the hero or a new Approach
   section, Town Hall / Eng Week detail intact. Converts "another AI-looking
   portfolio" into "the engineer who changed how his team ships."

The one decision that gates everything downstream: **which of these leads.**

---

## Next steps (architectural path)

1. User picks the sequencing / direction (skin-first vs centerpiece-first vs
   content-first; plus the Pile 1 open questions).
2. Revise `2026-09-06-portfolio-redesign-design.md` in place to the new direction.
3. Spec self-review, then user review.
4. `writing-plans` -> implementation plan.
5. Pile 2 + Pile 3 fold into the plan (or ship as a fast separate pass if the
   user wants them now).
