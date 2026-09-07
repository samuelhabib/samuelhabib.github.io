# Portfolio v2 — "System 7, remastered"

## Status

Design spec, awaiting user review. Supersedes the archived aurora-v1 build
(`archive/aurora-v1/`) and its spec (`2026-09-06-portfolio-redesign-design.md`).
Prompted by `2026-09-07-portfolio-audit.md` (four-agent audit found aurora-v1 read
as generic/AI-generated) and three reference-site teardowns (daedalOS, meowni.ca,
sajeth.dev).

## Concept

The site is a classic Macintosh desktop (System 7 era, ~1991). Not a working OS —
a faithful-in-spirit, cleaned-up interpretation ("heavily inspired, made a bit
better"). Windows are documents you open from the desktop; a **Terminal** window
holds a second, command-driven version of the résumé; **projects are HyperCard
stacks**. One committed 1-bit black-and-white visual language end to end.

Decided with the user:
- **Aesthetic:** approach B, "System 7 remastered" — full period visual language
  (1-bit b&w, dithered desktop, pixel window chrome, zoom-rect animations,
  HyperCard project decks, Chicago-style face for chrome) but with a scalable
  readable body face, responsive spacing, and a designed mobile/no-JS fallback.
  Latitude to improve on period detail where it helps.
- **Strictly 1-bit.** No accent colour. Interaction feedback is invert
  (white-on-black), the way real System 7 selection worked. Revisit only if the
  built result feels flat.
- **Terminal stays in-palette** — black on white, styled like the MPW Shell, not
  green-phosphor CRT. CRT flavour lives only in the boot sequence.
- **Stack:** Vite + React + TypeScript, static build, deployed to GitHub Pages via
  a GitHub Action. Repo is a user page (served at root) so Vite `base: '/'`.
- **Content source of truth:** `content/resume.md` (+ `content/projects/*.md`,
  `content/about.md`), parsed at build. Terminal `cat resume.md` prints it raw;
  the Résumé window renders it styled; the PDF is generated from the same source.

## Non-negotiable constraint: real static HTML

Every window's content ships as real semantic HTML in the served markup. The
desktop shell hydrates **over** pre-rendered content; it never generates it. A
recruiter with JS disabled, an ATS scraper, or a screen reader gets the full
résumé and about text as an ordinary document. This is sajeth.dev's fatal flaw
(its server HTML is only window chrome) and it matters more here because Samuel is
job-searching.

Corollaries:
- Boot sequence is skippable and `aria-hidden`, with the real content rendered
  underneath it from the first byte.
- The Résumé is reachable within one interaction of load (desktop icon + Apple-menu
  item + it may open on first load — see open questions).
- Requires a static-site-generation step for the React app (candidates:
  `vite-react-ssg`, `vike`, or a post-build prerender). Tool chosen in the plan.

---

## Aesthetic system

### Palette
- `--black: #000`, `--white: #fff`. Nothing else.
- Greys are achieved by **ordered dithering** (Bayer 4×4 / 8×8) as CSS background
  patterns or SVG, never by an actual grey value. A `.dither-50`, `.dither-25`,
  `.dither-75` utility set.
- Selection / hover / active / focus = full invert of the element's fill and text.

### Typography
- **Display / chrome** (menu bar, window titles, buttons, labels): a Chicago-style
  bitmap-flavoured webfont. Candidates: "ChiKareGo2", "Sysfont", "Pixel Chicago",
  or a modern Charcoal-alike. Rendered at sizes that keep it crisp
  (`image-rendering` handling for true bitmap faces). Pick in the plan after
  seeing them in the chrome.
- **Body** (résumé prose, About text, HyperCard cards): a readable face that holds
  the b&w world together — either a clean geometric/grotesque (e.g. a Geneva-alike
  such as "FindersKeepers"/"Geneva9" scaled up, or a neutral sans) or a crisp
  serif for long reading. One body face only.
- **Monospace** (Terminal, code): Monaco or a Monaco-alike.
- Rigid type scale: one body size, ~two heading sizes, one meta size. No `clamp()`
  soup.

### Window chrome
- Title bar: horizontal pinstripe lines (`repeating-linear-gradient`), centred
  title in the display face, **close box** (top-left square), **zoom box**
  (top-right), and the pinstripes clear behind the title. Inactive windows: title
  bar pinstripes drop away, title greys (via dither), no close/zoom boxes drawn.
- 1px pure-black border, 1px white inset, hard-edged. No shadow, or a 1-bit
  offset "drop shadow" made of a solid black rect.
- **Grow box** bottom-right only (classic Mac had no edge-resize). Optional
  **window-shade**: double-click the title bar rolls the window up to just its
  title bar (a real System 7.5 behaviour, good period detail, cheap).
- Scrollbars: square arrows top/bottom, a hollow or 50%-dithered thumb, no
  rounded anything.

### Desktop
- Full-bleed desktop pattern — the default System 7 "speckle" (a fine dither) or a
  chooseable classic pattern. No wallpaper image.
- Desktop **icons** top-right, snapped to an invisible grid: `Résumé`,
  `Projects` (a folder), `Terminal`, `Read Me`, `Trash` (bottom-right, doubles as
  an easter egg). 32×32-ish 1-bit icons, hand-drawn as SVG. Double-click (or
  single tap on mobile) opens; single click selects (invert).
- **Menu bar** fixed at top: Apple menu (`About This Portfolio`, plus a couple of
  "desk accessories" — see easter eggs), `File` (Open, Close, Save as PDF…,
  Print…), `Edit` (greyed-out Undo/Cut/Copy/Paste for authenticity, "Select All"
  works in text), `View` (icon size / list, low priority), `Special` (Restart —
  replays the boot; "Shut Down" — triggers the CRT-off animation then a "It is now
  safe to…" screen), and a **live clock** at the right.

### Motion vocabulary
One small timing scale, mostly `steps()` / linear easing (period-accurate), short
durations (120–260ms):
- **Zoom-rects** — window open/close animates an expanding/collapsing wireframe
  rectangle between the source icon and the final window bounds, then the window
  appears. The signature move.
- **Outline drag** — dragging a window shows only its 1px outline following the
  cursor until release (toggle: also offer live drag; outline is the authentic
  default).
- **Dithered dissolve** — state/card transitions use a Bayer-pattern wipe.
- **CRT power-off** — "Shut Down" collapses the screen to a horizontal line then a
  dot. Used once, deliberately.
- **Menu drop** — menus snap open (no fade), highlight inverts on hover, a thin
  "flash" on selection.
- **Boot build-in** — desktop pattern paints, menu bar draws, icons pop in
  top-to-bottom.
- `prefers-reduced-motion`: dissolves/flicker/zoom-rects become instant state
  swaps; drag becomes live-position; boot skips to done.

---

## Structure / windows

### Boot sequence
Happy-Mac icon, "Welcome to Macintosh", a marching-striped progress bar,
extension icons marching along the bottom (a few as a nod: a Claude icon, a
coffee cup, a `git` icon). ~1.5s total. Skippable with any key/click/tap. Plays
once per tab (`sessionStorage`). `aria-hidden`; real content already in the DOM
behind it. Optional startup chime, **muted by default**, only ever plays on an
explicit user gesture.

### Terminal
Custom React shell — **not xterm.js** (wrong tool for clickable, component-rich
output). Architecture follows the sajeth.dev teardown's recommended pattern:

- **Command registry**: `{ name, aliases?, hidden?, description, usage?, run(args, ctx): ReactNode }`.
- Commands **return React nodes**, not strings — gives coloured/inverted spans,
  clickable links, tables, formatted lists with zero parsing.
- **`ctx`**: `{ run(str), open(windowId), close(windowId), clear(), print(node), theme, cwd }`.
  `ctx.open('resume')` focuses/opens the GUI Résumé window — this is the
  Terminal↔desktop integration point.
- **Commands:** `help` / `?` (derived from the registry, `hidden` filtered),
  `about` / `whoami`, `resume` / `cat resume.md` (prints the raw markdown,
  charming and honest), `experience` (formatted as `git log --oneline` fake
  commits — steal sajeth.dev's treatment), `skills` (pretty-printed JSON),
  `projects` (list; `open projects` or `projects crisis` opens a stack), `open <app>`,
  `contact`, `date`, `clear` (intercepted pre-registry), `ls` (lists the
  "documents"), plus hidden: `echo`, `pwd` → `/Users/samuel`, `uname`, `sudo`
  (denies with a joke), `sysbeep`, `hypercard` (opens Projects). Small, curated;
  no fake features that don't work.
- **Input:** command history (↑/↓), tab-completion (registry-derived, single
  candidate ghost-text, `hidden` excluded — sajeth.dev leaked hidden commands
  here, we won't), Ctrl+L / Cmd-K clear, click-anywhere-refocuses.
- **Output:** instant (no typewriter). Only the boot sequence is time-sequenced.
- **`aria-live="polite"`** wrapper on the output log so screen readers announce
  results.
- **Mobile:** every command in `help` and every listed item is also a tappable
  button; a persistent chip row of the top commands. Typing optional, never
  required.

### Résumé window
- The visual CV. Rendered from `content/resume.md` (front-matter + markdown,
  parsed at build to structured data).
- Sections: header (name, title, location, links), Experience, Skills, Education,
  Projects (short). Styled as a clean System-7 document — pinstripe section rules,
  the display face for headings, the body face for prose.
- **"Save as PDF"** (File menu + a button): a print stylesheet that lays the
  résumé out as a proper one/two-page document, or a generated PDF from the same
  data. `Resume.pdf` at repo root stays as a direct link too.
- This window's markup is the accessible/no-JS fallback: semantic `<article>`,
  correct heading order, real links.
- Fixes carried from the audit: correct dates (Apple "Sept 2023 – Present", not
  "2023 – 2026"); TMU "2019 – 2024" consistently; Kotlin present in skills; Solr
  categorised as search not AI; drop "fine-tuned" before RoBERTa unless confirmed;
  include the 2B+ records/hr figure.

### Projects — HyperCard stacks
- One stack per project, opened from the `Projects` folder window or the Terminal.
- **Card model:** Title → Problem → Approach → Result → Tech/Links. Black-and-white
  card art (simple 1-bit diagrams, dithered fills).
- **Navigation:** on-card buttons (`◀ Prev`, `Next ▶`, `Home`), keyboard
  arrows, a "card N of M" indicator. HyperCard-style **visual transitions**
  between cards (dissolve, wipe left/right, iris, barn door) implemented with
  dithered masks.
- **Projects:** Mental Health Crisis Detection (real content); AI Fitness /
  Calorie bot (**placeholder content, flagged as such** — do not invent
  specifics). Open question below on whether to add ExaCare work (Provider
  Directory, Referral Outbound Center) as stacks.
- Content from `content/projects/<slug>.md` with a light card-delimiter
  convention.

### Read Me (About)
- A `SimpleText`-style document window. First-person, personality-forward — the
  voice lessons from the meowni.ca teardown:
  - self-deprecation as the default register; address the reader directly;
    section headings as questions ("Why healthcare data?"); admit the seams; no
    buzzword soup; no LinkedIn headline-ese.
- Must contain, per the audit's "voice" findings:
  - an origin line (why software / why this work),
  - one unhedged opinion about engineering (his track record points at "systems
    that don't need babysitting" — self-healing reconciliation, killing noisy
    alarms, cutting on-call toil),
  - why fragmented real-world healthcare data is the problem he likes,
  - the **Claude Code / Superpowers story as load-bearing**, not a buried bullet:
    he introduced it at ExaCare and presented it company-wide (Town Hall, Eng
    Week). This is the rare, verifiable version of "AI-driven engineer."
  - one honest non-résumé line (outside work / currently learning) — templated
    with a blank for Samuel, not invented.
- Content in `content/about.md`.

### Easter eggs (small, curated)
1. A working **desk accessory** in the Apple menu — the authentic 15-tile
   sliding **Puzzle** that shipped on every Mac, or a tiny playable game
   (meowni.ca ships Snake in ~120 lines). One, not several.
2. **"About This Portfolio"** — the classic "About This Macintosh" dialog
   reworked: a version line, a built date, and a "Total Memory" bar with a joke
   allocation (e.g. "Coffee", "Side projects", "Sleep") as dithered bar segments.
3. **Trash** — dragging a window to the Trash "deletes" it with the crumple
   sound/animation; it comes back on reload. Low priority.

---

## Content model

```
content/
  resume.md        # front-matter + markdown, the single résumé source
  about.md         # the Read Me copy
  projects/
    crisis-detection.md
    fitness-bot.md  # placeholder, flagged
```

A build step parses these into typed data consumed by the Résumé window, the
Terminal (`cat`, `experience`, `skills`, `projects`), and the PDF generator. The
Terminal's `cat resume.md` prints the raw markdown text (deliberate — it should
look like reading the file). House copy style: plain, first person, dry, specific,
no buzzword soup, sparing with em dashes (not a hard ban this time — taste over
rule).

---

## Technical architecture

- **Vite + React + TS.** CSS Modules or plain CSS with a token file; no heavy CSS
  framework. `image-rendering: pixelated` where bitmap faces/icons need it.
- **Static generation** for the real-HTML constraint (tool TBD in plan).
- **Window manager:** lightweight custom — pointer-events drag (outline by
  default), z-index focus stack, open/close/zoom/window-shade, grow box. No dock
  (period-accurate); minimised windows collapse to the title bar or to the
  desktop. `react-rnd` optional; classic resize is grow-box only so probably
  hand-rolled.
- **State:** React context + `useReducer` for window state; `sessionStorage` for
  "booted"; **no persistence** of window layout (keep it simple).
- **Routing / deep links:** `?open=resume`, `?open=projects&stack=crisis`. Shareable
  links into a specific window.
- **Motion:** Framer Motion or hand-rolled for zoom-rects and dissolves; decide in
  the plan (zoom-rects may be simpler hand-rolled with a single animated `<div>`
  outline).
- **Deploy:** GitHub Action — `npm ci && npm run build`, then
  `actions/upload-pages-artifact` + `actions/deploy-pages`. Add `public/.nojekyll`.
  Keep `Resume.pdf` at the served root. `main` remains the branch; the Action
  publishes the built `dist/`.

## Mobile / no-JS fallback

Below ~768px the desktop metaphor is **replaced**, not shrunk:
- Windows render as a single vertically-stacked scroll of "documents"; each title
  bar becomes a sticky section header with a close/collapse affordance.
- Menu bar collapses to a simple top nav (Résumé / Projects / Terminal / Read Me).
- Terminal is tap-driven with the command list always visible.
- No dragging, no zoom-rects; dithered dividers stay for texture.
- No-JS: the pre-rendered document stack is the site. It reads top to bottom:
  Résumé, Read Me, Projects, contact.

## Accessibility

- Semantic content markup; one `<h1>`, correct heading order per document.
- `aria-live` on Terminal output; focus trap + focus return on modal dialogs
  (About box, Save dialog); Esc closes the front window; Tab cycles windows;
  visible focus style (invert outline).
- `prefers-reduced-motion` honoured everywhere (see motion vocabulary).
- Contrast is pure black/white — trivially AA/AAA. `color-scheme: light`.
- Skip link to main content. Desktop icons are `<button>`s with labels.
- Boot is `aria-hidden` and skippable; real content underneath from first paint.

## SEO / meta

- `<title>`, meta description, canonical.
- **Open Graph image:** a 1-bit screenshot of the desktop — on-brand and
  distinctive in a LinkedIn/iMessage unfurl.
- Favicon: the smiling-Mac / a classic Mac icon.
- `schema.org/Person` JSON-LD (name, jobTitle, worksFor, alumniOf, sameAs).
- `sitemap.xml`, `robots.txt`.

## Reuse from aurora-v1

Mostly a fresh visual start. Salvageable:
- Verified content facts (companies, dates, metrics) — already in the audit.
- The "messy data → clean structure" idea could become a 1-bit card diagram in
  the Provider Directory stack, or a Trash/boot easter egg.
- The city journey (Toronto → Austin → New York) could be a card in an About or
  a "Trip" stack, redrawn 1-bit.
Not reused: aurora hero, gradient text, constellation, the chat-demo components.

## Out of scope / deferred

- Sound design beyond the one optional chime.
- Fitness-bot project full content (stays placeholder until Samuel provides it).
- Guestbook / any server or multiplayer feature.
- A real virtual filesystem; `cd`, `mkdir`, file editing in the Terminal.
- Theme switching / multiple palettes (we commit to one look).
- PWA / offline / service worker.
- Window-layout persistence.
- Merging to `main` / going live — this spec covers building on
  `new-and-improved`.

## Open questions for user review

1. **First load:** just the bare desktop, or does the **Résumé window open
   automatically** (cascaded under a small "Read Me" note)? The latter gets a
   recruiter to the content in zero clicks; the former is more authentic.
2. **Projects scope:** keep Projects to the two side projects (matches the
   résumé), or also build **ExaCare work** (Provider Directory, Referral Outbound
   Center) as HyperCard stacks? Work stacks show the day-job impact visually but
   need care with anything non-public.
3. **Easter-egg game:** the authentic 15-tile **Puzzle** desk accessory, or
   something more fun (Snake, a tiny asteroids)?
4. **Startup chime:** OK to include (muted by default, user-triggered only)?
5. **Custom domain** ever (e.g. `samuelhabib.com`), or staying on
   `samuelhabib.github.io`? Affects canonical/OG URLs and the deploy config.
6. **Body typeface direction:** clean sans (more "cleaned-up/modern") or a crisp
   serif for long reading (warmer, more editorial)? I can show both in the plan.
