# Portfolio redesign

## Goal

Replace the current personal site (a 2023-era HTML5UP template) with a from-scratch, single-page site that feels developer-inspired and Apple-esque: dark, cinematic, confident, with animation quality on par with animejs.com / motion.dev examples. The site should read as the work of an AI-driven software engineer, not a generic template, and show some personality alongside the professional history.

The old site is retired into a backup folder rather than deleted. The resume file is replaced with the current PDF. A small side deliverable (new resume bullet points) is produced from an internal promotion document, for the user to fold into their resume separately.

## Content facts (verified against source documents)

These were checked against `Samuel_Habib_Resume_Jan_26 (1).pdf` and `Final SWE III Promotion Case.md` (an internal ExaCare promotion document) during brainstorming, because the reference file's content could not be taken on faith.

- **Current role:** Software Engineer at ExaCare, started February 2026, based in New York. The resume PDF has not been updated since the ExaCare move and still lists Apple as current; the site should reflect ExaCare as current, Apple as most recent past role.
- **Career path:** Toronto (TMU, AMD, Amazon), then Austin (Apple, Sept 2023 to 2026), then New York (ExaCare, Feb 2026 to present).
- **ExaCare "now" narrative**, drawn from the promotion document:
  - Owned the Referral Outbound Center (ROC) end to end, from proof of concept to launch and ongoing feature work; piloted 25+ sender facilities at 100% retention.
  - Self-scoped and built the Provider Directory: an ingestion pipeline over public CMS/NPI healthcare data (40,000+ rows across six rosters), with self-healing weekly reconciliation.
  - Built an internal on-call report tool, cutting weekly report time by roughly 50%.
  - Cut a core API endpoint's warm median latency by 42% and its response payload by 70%; eliminated full-table scans responsible for ~57% of database time behind alarms firing ~144 times a day.
  - Do **not** state a leveling claim ("Software Engineer III", "promoted to"). The promotion case is still pending, not final. Keep title as "Software Engineer."
- **Apple, Amazon, AMD experience:** use the resume bullets as the source of truth (they're already accurate and specific: BART, receipt-parsing service, OIDC/RBAC, Solr search, 80%/95% figures for Apple; the two Amazon internships with their own distinct scopes; AMD's Ruby/CI-CD work).
- **Education:** Toronto Metropolitan University, B.Eng Computer Engineering, CGPA 3.90, Aug 2019 to May 2024.
- **Projects section**, two entries:
  1. Mental Health Crisis Detection, an AI chatbot (GPT-3.5, RoBERTa, NLP, Flask/React/Firebase), as already described in the reference file.
  2. An AI fitness and calorie-tracking chatbot that nudges the user, counts calories, and suggests meal modifications, with memory of groceries supplied from Instacart. **Content here is intentionally a placeholder.** The user will provide fuller details before this is finalized; do not invent specifics beyond what's stated here.
- Drop the four old school-project entries (Retail Store DBMS, Drawing Game, 2D Unity Game, Book Store App) entirely.
- No personal photo anywhere on the site.

## Visual direction (validated interactively via mockups)

The visual language is dark, cinematic, and consistent end to end, not a patchwork of different demo styles. Everything lives in one palette: near-black backgrounds (`#06070d`/`#0a0a0c`), soft blue-to-teal aurora glows, white/off-white text, a signal-green accent (`#6be89a`) for "live" elements and a blue accent (`#0071e3`/`#2b5cff`) for primary actions, matching the reference file's existing palette.

Confirmed components, in the order they'd appear on the page:

1. **Hero: terminal boot, then name reveal.** The page opens on a small terminal window that types out a few lines (`whoami`, a one-line personality bit, a status line) before dissolving into the existing large gradient-text name reveal (`Samuel Habib`, kicker, lead line, CTA buttons). One continuous beat, not two separate sections.
2. **Existing canvas data-visualizations are kept as-is**: the "chaos into order" Provider Directory visualization and the Referral Outbound Center hub-and-packets visualization from the reference file. These were already validated and liked; they anchor the "Now" section.
3. **Skill constellation**: the skills/toolkit section becomes a small live network graph (nodes drift gently, edges pulse between related tools) instead of a plain grouped list.
4. **Per-card bespoke live diagrams, replacing any generic hover effect.** Rejected: 3D tilt cards, rotating border-beam cards. Approved: every major project/experience card gets its own small, accurate diagram of what that thing actually does, always animating (not hover-gated): ROC's card shows three facilities routing through the hub to a recipient; Crisis Detection's card shows a message triggering a sentiment network, a risk meter climbing, and an escalation firing. The fitness-bot card gets an equivalent bespoke diagram once its details are finalized.
5. **Live AI-reply demo**, the most-liked single component: inside the fitness-bot project card, a two-bubble chat interaction plays on a loop, showing a user message, a thinking indicator, then a streamed reply referencing the user's groceries. This demonstrates the product instead of describing it.
6. **Landmark journey, on a real map.** The city-to-city timeline (Toronto, then Austin, then New York) is redrawn as a signal traveling across a simplified, low-poly map of North America, with each city plotted at its real latitude/longitude rather than an arbitrary layout (this was checked explicitly: Toronto lands on Lake Ontario, Austin lands inland in Texas, New York lands on the coast). A glowing dot with a short comet trail travels a dashed path between the three points; a small monoline landmark icon (CN Tower, Texas State Capitol, Statue of Liberty) lights up with a location-pin ping as the signal reaches each city, alongside the city name, chapter (companies), and years.
7. **Magnetic buttons**: primary CTA buttons pull toward the cursor with a springy snap-back, used sparingly on key actions (not every button).
8. **Apple-style scroll choreography throughout**: fade-up-with-blur reveals on section entry, staggered list children, count-up stats, and scroll-scrubbed progress on the canvas visualizations, extending the reveal/stagger pattern already in the reference file to the whole page, not just the sections that already had it.
9. **Company marks**: small monochrome recreations of the Apple, Amazon, AMD, and ExaCare marks used as a "worked at" garnish (e.g. next to each experience row). These are simple hand-drawn monoline recreations for placement purposes, not official brand assets; swap in official SVGs later if the user has brand-safe versions on hand.

Explicitly rejected during iteration: the "hybrid" mockup that flattened the aurora hero into a plain bento-grid section (felt worse than the starting point), the plain circuit-board version of the journey (superseded by the real map), and both card-hover treatments (tilt, border-beam) in favor of the bespoke-diagram approach.

## Writing style

All site copy must read as high-quality, professional writing with no em dashes anywhere (use periods, commas, or colons instead). No filler, no buzzword soup. This applies to every section, not just the hero.

## Technical approach

- Static site, zero build step, matching the constraint that this deploys to GitHub Pages. No framework, no bundler.
- Split into `index.html`, `assets/css/style.css`, and `assets/js/main.js` rather than one giant inline file (the reference file was a single file; splitting keeps the substantial amount of custom animation code, terminal typing, constellation, map journey, chat demo, per-card diagrams, navigable). SVG landmark/map artwork can live inline in the HTML (it needs to interact with JS for the lit-up states) or in the JS as template strings; decide at implementation time based on what stays cleanest.
- Respect `prefers-reduced-motion`, following the reference file's existing pattern of disabling non-essential animation for users who request it.
- Responsive behavior follows the reference file's existing breakpoints and patterns; the new components (constellation, map, terminal) need their own mobile-sized treatment, decided during implementation.
- No personal photo; no new image assets required beyond whatever small inline SVGs the new components need.

## Repository changes

- Create a `legacy/` folder at the repository root. Move (not copy, preserving git history via `git mv`) the current `index.html`, `assets/`, and `images/` into it, so the old site is fully preserved and inspectable but no longer live at the root.
- Replace `Resume.pdf` at the repository root with the contents of `Samuel_Habib_Resume_Jan_26 (1).pdf` from Downloads, keeping the filename `Resume.pdf` so existing links keep working. Remove the stale duplicate copy at `images/Resume.pdf` (it moves into `legacy/` along with the rest of `images/`).
- Build the new site as `index.html` (plus `assets/css/style.css`, `assets/js/main.js`) at the repository root.

## Out of scope / deferred

- Final visual polish of the hand-drawn landmark icons and the North America coastline path. Current fidelity is "clearly readable, geographically consistent" placeholder quality; a pass to clean up the linework happens during implementation, not before.
- Fitness/calorie-tracking bot project: full description, tech stack, and its bespoke card diagram wait on more detail from the user.
- Sourcing or redrawing higher-fidelity company logo marks (currently planned as simple monoline recreations).
- Merging this branch into `main` / going live. This spec covers building the new site on the current branch only.

## Side deliverable (not part of the implementation plan)

Write a short markdown file with new resume bullet points and a section header, distilled from `Final SWE III Promotion Case.md`, for the user to manually fold into their resume. This is a quick content-writing task, independent of the site build, done once and handed over rather than tracked as an implementation step.
