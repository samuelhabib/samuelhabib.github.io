# Projects Presentation Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn every real project into a hand-authored 1-bit "Keynote" deck (diagram / stat / icon-point slides) while the markdown stays the canonical detail, reachable from a "Full write-up" window.

**Architecture:** The slide type system, `SlideView`, the diagram registry, `DeckIcon`, and a Provider Directory deck already shipped (the slice). This plan polishes that, adds two diagrams and two more decks (Referral, Crisis), and adds a write-up reading window wired through `ProjectsDeck`. A project with a `DECKS[slug]` entry plays typed slides; the rest fall back to markdown cards unchanged.

**Tech Stack:** Vite 5 + React 18 + TS 5, `vite-react-ssg@0.7.3` (pinned), Vitest + @testing-library/react (`src/**/*.{test,spec}.{ts,tsx}`), Playwright + @axe-core/playwright (`tests/**`, built + previewed site on 4173).

**Spec:** `docs/superpowers/specs/2026-09-08-projects-presentation-layer-design.md` — read it alongside this plan.

## Global Constraints

- Static GitHub Pages. Every window's content ships as real HTML; `scripts/assert-prerendered.mjs` stays green.
- Strictly 1-bit: `#000`/`#fff` via tokens, greys only via the dither utilities, **no `opacity`** for de-emphasis (use `line-through`, hatching, borders, full invert). Diagrams stroke/fill with `currentColor` so they invert with the theme.
- `prefers-reduced-motion: reduce` honoured — every entrance has an instant-cut path (`SlideView` already gates on `prefersReducedMotion()`; the global media rule zeroes durations).
- No new runtime dependencies.
- One commit per task on `new-and-improved`. **No push without an explicit ask.** End every commit message with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01NnmN4mHyjEgrk2WpR6QcQx
  ```
- Per-task gate: `npx tsc --noEmit` && `npm test -- --run` && `npm run build && npm run prerender:assert` && `npm run test:e2e` all green before the task's commit. (Run the full e2e at each sub-plan boundary and on any task touching `tests/*`, `index.html`, `src/App.tsx`, `scripts/assert-prerendered.mjs`, or CSS an e2e asserts; `tsc + unit` on every task.)
- **Baseline:** 166 unit tests (38 files), 57 e2e, tsc / build / prerender clean. The presentation-layer slice is already committed on `new-and-improved`.

---

## File Structure

**Created:**
- `src/windows/deck/diagrams/ReferralPipeline.tsx` — referral flow diagram (B-1)
- `src/windows/deck/diagrams/RecallVsCost.tsx` — false-negative asymmetry grid (B-2)
- `src/windows/deck/decks/referral-outbound-center.ts` — Referral deck (C-1)
- `src/windows/deck/decks/crisis-detection.ts` — Crisis deck (D-1)
- `src/windows/WriteupWindow.tsx` — one project's markdown detail as an `<article>` (E-1)
- `src/windows/deck/slideView.layout.test.ts` — CSS-invariant guard for the polish (A-1)
- `tests/writeup.spec.ts` — e2e for the Full write-up affordance (E-2)

**Modified:**
- `src/windows/deck/SlideView.module.css` — centre the column, tighten rhythm (A-1)
- `src/windows/deck/diagrams/ReconcileLoop.tsx` — de-collide the self-heal label + arrow (A-2)
- `src/windows/deck/slideTypes.ts` — `DiagramName` gains `'ReferralPipeline' | 'RecallVsCost'` (B-1, B-2)
- `src/windows/deck/diagrams/index.ts` — register the two diagrams (B-1, B-2)
- `src/windows/deck/decks/index.ts` — register the two decks (C-1, D-1)
- `src/windows/deck/decks/decks.test.ts` — already validates the registry; new decks are covered automatically
- `src/windows/projectsContent.tsx` — `export` `ProjectSection` for reuse (E-1)
- `src/shell/windows.ts` — `WindowId` += `'writeup'`; `DEFAULTS.writeup`; `make('writeup')` (E-1)
- `src/windows/ProjectsDeck.tsx` — "Full write-up" nav link + `onOpenWriteup` prop (E-2)
- `src/windows/ProjectsWindow.tsx` — thread `onOpenWriteup` (E-2)
- `src/shell/Desktop.tsx` — `TITLES.writeup`, `writeupSlug` state, `content.writeup`, wire `onOpenWriteup` (E-2)
- `src/windows/ProjectsDeck.test.tsx` — Referral + Crisis are now typed decks (C-1, D-1)
- `tests/projects.spec.ts` — same (C-1, D-1)

---

# Sub-plan A · Polish the shipped slice

### Task A-1: Centre the slide column, tighten vertical rhythm

**Files:**
- Modify: `src/windows/deck/SlideView.module.css`
- Create: `src/windows/deck/slideView.layout.test.ts`

- [ ] **Step 1: Write the failing test** — `src/windows/deck/slideView.layout.test.ts`

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/windows/deck/SlideView.module.css'), 'utf8')

describe('SlideView layout', () => {
  it('centres the slide column horizontally', () => {
    const slide = css.slice(css.indexOf('.slide {'), css.indexOf('}', css.indexOf('.slide {')))
    expect(slide).toMatch(/margin(-inline)?:\s*[^;]*auto/)
  })
  it('lets centred layouts use the full width', () => {
    const center = css.slice(css.indexOf('.center {'), css.indexOf('}', css.indexOf('.center {')))
    expect(center).toContain('max-width: none')
  })
})
```

- [ ] **Step 2: Run it — expect FAIL**
  Run: `npm test -- --run src/windows/deck/slideView.layout.test.ts`

- [ ] **Step 3: Edit `src/windows/deck/SlideView.module.css`** — replace the `.slide` and `.center` rules:

```css
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  max-width: 62ch;
  margin-inline: auto;
  padding-block: 4vh;
}
.center {
  align-items: center;
  text-align: center;
  max-width: none;
}
```

- [ ] **Step 4: Run it + the existing SlideView tests — expect PASS**
  Run: `npm test -- --run src/windows/deck/`

- [ ] **Step 5: Commit**
```bash
git add src/windows/deck/SlideView.module.css src/windows/deck/slideView.layout.test.ts
git commit -m "fix: centre the presentation slide column on wide decks"
```

### Task A-2: De-collide `ReconcileLoop`

**Files:**
- Modify: `src/windows/deck/diagrams/ReconcileLoop.tsx`
- (test: `src/windows/deck/SlideView.test.tsx` already asserts the diagram mounts with an accessible name; keep it green.)

- [ ] **Step 1: Add a structural assertion** to `src/windows/deck/SlideView.test.tsx` inside the existing `diagram slide` test:

```tsx
// self-heal caption lives in the SVG and is the last text node (below the loop)
const svg = screen.getByRole('img', { name: /reconcile/i })
const texts = [...svg.querySelectorAll('text')].map((t) => t.textContent)
expect(texts.some((t) => /self-heal/i.test(t ?? ''))).toBe(true)
expect(texts.filter((t) => /DIRECTORY/i.test(t ?? '')).length).toBe(1)
```

- [ ] **Step 2: Run it — expect FAIL** if the current SVG has no `/self-heal/` `<text>` after the change; PASS is fine too — the real check is Step 4.

- [ ] **Step 3: Rewrite `src/windows/deck/diagrams/ReconcileLoop.tsx`** with a taller viewBox and a clear band for the loop label:

```tsx
import styles from './diagram.module.css'

export default function ReconcileLoop() {
  const rosterY = [14, 38, 62, 86, 110, 134]
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 480 288"
      role="img"
      aria-labelledby="reconcileLoop-title"
      focusable="false"
    >
      <title id="reconcileLoop-title">
        Six public rosters normalized into one directory that reconciles itself weekly
      </title>
      <defs>
        <marker id="rl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* connectors */}
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" markerEnd="url(#rl-arrow)">
        {rosterY.map((y, i) => (
          <line key={i} x1="74" y1={y + 10} x2="168" y2="110" />
        ))}
        <line x1="258" y1="110" x2="298" y2="110" />
        {/* weekly self-heal loop — a clean arc under everything, ending back at the sources */}
        <path strokeDasharray="5 4" d="M356 138 C356 220 96 236 44 198 C22 182 24 156 26 148" />
      </g>

      {/* boxes (fill so connectors don't show through labels) */}
      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {rosterY.map((y, i) => (
          <rect key={i} x="8" y={y} width="66" height="20" rx="1" />
        ))}
        <rect x="168" y="88" width="90" height="44" rx="1" />
        <rect x="298" y="84" width="118" height="52" rx="1" />
        <rect x="302" y="88" width="118" height="52" rx="1" />
      </g>

      {/* labels */}
      <g fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="11" textAnchor="middle">
        <text x="41" y="9">6 public rosters</text>
        <text x="213" y="106">normalize</text>
        <text x="213" y="119">to one shape</text>
        <text x="361" y="106" fontSize="13">DIRECTORY</text>
        <text x="361" y="122">40,000+ rows</text>
        <text x="240" y="272">weekly self-heal — diffs the live sources, repairs drift</text>
      </g>
    </svg>
  )
}
```

- [ ] **Step 4: Build, screenshot, nudge.** `npm run build && npm run preview -- --port 4173 --strictPort`, open the deck to the Provider Directory diagram slide, screenshot. Verify: the self-heal label sits in its own band below the arc (no overlap with the arc, the rosters, or the boxes); the loop arrowhead points cleanly back toward the roster stack; the double-border DIRECTORY box is intact. Adjust the arc control points / label `y` until clean.

- [ ] **Step 5: Full unit + commit**
```bash
npm test -- --run src/windows/deck/
git add src/windows/deck/diagrams/ReconcileLoop.tsx src/windows/deck/SlideView.test.tsx
git commit -m "fix: ReconcileLoop self-heal label + return arrow no longer collide"
```

---

# Sub-plan B · Two more diagrams

### Task B-1: `ReferralPipeline` diagram

**Files:**
- Create: `src/windows/deck/diagrams/ReferralPipeline.tsx`
- Modify: `src/windows/deck/slideTypes.ts`, `src/windows/deck/diagrams/index.ts`
- Test: `src/windows/deck/SlideView.test.tsx`

**Interfaces:**
- Produces: default-exported `ReferralPipeline` React component; `DiagramName` includes `'ReferralPipeline'`; `DIAGRAMS.ReferralPipeline` set.

- [ ] **Step 1: Extend `slideTypes.ts`**

```ts
export type DiagramName = 'ReconcileLoop' | 'ReferralPipeline' | 'RecallVsCost'
```

- [ ] **Step 2: Add a render test** to `src/windows/deck/SlideView.test.tsx`

```tsx
it('renders the ReferralPipeline diagram with its stages', () => {
  render(<SlideView play={false} slide={{ layout: 'diagram', name: 'ReferralPipeline' }} />)
  const svg = screen.getByRole('img', { name: /referral/i })
  const texts = [...svg.querySelectorAll('text')].map((t) => t.textContent?.toLowerCase() ?? '')
  for (const stage of ['send', 'track', 'follow up']) {
    expect(texts.some((t) => t.includes(stage))).toBe(true)
  }
})
```

- [ ] **Step 3: Run — expect FAIL** (`DIAGRAMS.ReferralPipeline` undefined → render throws).

- [ ] **Step 4: Create `src/windows/deck/diagrams/ReferralPipeline.tsx`**

```tsx
import styles from './diagram.module.css'

export default function ReferralPipeline() {
  const stages = ['Sender\nfacility', 'Send', 'Service\n+ queue', 'Track\nstate', 'Follow up']
  const states = ['Sent', 'Received', 'Actioned', 'Closed']
  return (
    <svg className={styles.svg} viewBox="0 0 520 240" role="img" aria-labelledby="referralPipeline-title" focusable="false">
      <title id="referralPipeline-title">
        Outbound referral flow: sender facility, send, service and queue, tracked state, follow up
      </title>
      <defs>
        <marker id="rp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>

      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {stages.map((_, i) => (
          <rect key={i} x={8 + i * 102} y="40" width="86" height="52" rx="1" />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#rp-arrow)">
        {stages.slice(1).map((_, i) => (
          <line key={i} x1={94 + i * 102} y1="66" x2={110 + i * 102} y2="66" />
        ))}
      </g>
      <g fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="11" textAnchor="middle">
        {stages.map((label, i) =>
          label.split('\n').map((line, j) => (
            <text key={`${i}-${j}`} x={51 + i * 102} y={62 + j * 14}>
              {line}
            </text>
          )),
        )}
        <text x="260" y="150" fontSize="11">one place to send, monitor and follow up — state legible at a glance</text>
      </g>

      {/* the referral's own state row */}
      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        {states.map((_, i) => (
          <rect key={i} x={70 + i * 96} y="176" width="80" height="30" rx="1" />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#rp-arrow)">
        {states.slice(1).map((_, i) => (
          <line key={i} x1={150 + i * 96} y1="191" x2={166 + i * 96} y2="191" />
        ))}
      </g>
      <g fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="11" textAnchor="middle">
        {states.map((s, i) => (
          <text key={i} x={110 + i * 96} y="195">
            {s}
          </text>
        ))}
      </g>
    </svg>
  )
}
```

- [ ] **Step 5: Register + run + screenshot-nudge + commit.** In `src/windows/deck/diagrams/index.ts`:

```ts
import ReferralPipeline from './ReferralPipeline'
// ...
export const DIAGRAMS: Record<DiagramName, ComponentType> = {
  ReconcileLoop,
  ReferralPipeline,
  RecallVsCost, // added in B-2
}
```

  (If `tsc` complains that `RecallVsCost` is missing, add B-2's stub first or temporarily omit the key and restore it in B-2.) Run `npm test -- --run src/windows/deck/ && npx tsc --noEmit`, build + screenshot the diagram, nudge coordinates so nothing overlaps.

```bash
git add src/windows/deck/slideTypes.ts src/windows/deck/diagrams/ReferralPipeline.tsx src/windows/deck/diagrams/index.ts src/windows/deck/SlideView.test.tsx
git commit -m "feat: ReferralPipeline 1-bit diagram"
```

### Task B-2: `RecallVsCost` diagram

**Files:**
- Create: `src/windows/deck/diagrams/RecallVsCost.tsx`
- Modify: `src/windows/deck/diagrams/index.ts`
- Test: `src/windows/deck/SlideView.test.tsx`

- [ ] **Step 1: Add a render test** to `src/windows/deck/SlideView.test.tsx`

```tsx
it('renders the RecallVsCost grid emphasising the missed cell', () => {
  render(<SlideView play={false} slide={{ layout: 'diagram', name: 'RecallVsCost' }} />)
  const svg = screen.getByRole('img', { name: /recall|missed|cost/i })
  const texts = [...svg.querySelectorAll('text')].map((t) => t.textContent?.toLowerCase() ?? '')
  expect(texts.some((t) => t.includes('missed'))).toBe(true)
  expect(texts.some((t) => t.includes('false alarm'))).toBe(true)
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Create `src/windows/deck/diagrams/RecallVsCost.tsx`** — a 2×2 grid; the false-negative cell filled with the dither hatch (`repeating-linear-gradient` can't go in SVG, so use a `<pattern>` of 1px lines) and a bold outline; the false-positive cell plain and quiet.

```tsx
import styles from './diagram.module.css'

export default function RecallVsCost() {
  return (
    <svg className={styles.svg} viewBox="0 0 420 300" role="img" aria-labelledby="recallVsCost-title" focusable="false">
      <title id="recallVsCost-title">
        Outcome grid: missing a real crisis is the expensive error; a false alarm is cheap
      </title>
      <defs>
        <pattern id="rc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--c-bg)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="2" />
        </pattern>
      </defs>

      <g fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="11" textAnchor="middle">
        <text x="150" y="24">flagged</text>
        <text x="300" y="24">not flagged</text>
      </g>
      <g fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="11" textAnchor="end">
        <text x="70" y="90">actual{' '}crisis</text>
        <text x="70" y="210">actual{' '}not</text>
      </g>

      {/* cells */}
      <g stroke="currentColor" strokeWidth="2" fill="var(--c-bg)">
        <rect x="80" y="36" width="140" height="110" />
        <rect x="220" y="36" width="140" height="110" fill="url(#rc-hatch)" strokeWidth="4" />
        <rect x="80" y="146" width="140" height="110" />
        <rect x="220" y="146" width="140" height="110" />
      </g>
      <g fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="12" textAnchor="middle">
        <text x="150" y="96">caught</text>
        <text x="290" y="90" fontSize="13">MISSED</text>
        <text x="290" y="108" fontSize="10">the expensive one</text>
        <text x="150" y="206">false alarm</text>
        <text x="150" y="222" fontSize="10">cheap</text>
        <text x="290" y="206">correct pass</text>
      </g>
      <text x="220" y="286" fill="currentColor" fontFamily="var(--chrome-font, sans-serif)" fontSize="11" textAnchor="middle">
        tuned for recall on the crisis class
      </text>
    </svg>
  )
}
```

- [ ] **Step 4: Register in `index.ts`, run, screenshot-nudge.** Confirm the hatch renders as hard 1px lines (no grey), the MISSED cell reads as the emphasised one.

- [ ] **Step 5: Commit**
```bash
git add src/windows/deck/diagrams/RecallVsCost.tsx src/windows/deck/diagrams/index.ts src/windows/deck/SlideView.test.tsx
git commit -m "feat: RecallVsCost 1-bit outcome grid"
```

---

# Sub-plan C · Referral Outbound Center deck

### Task C-1: `referral-outbound-center.ts` + test updates

**Files:**
- Create: `src/windows/deck/decks/referral-outbound-center.ts`
- Modify: `src/windows/deck/decks/index.ts`, `src/windows/ProjectsDeck.test.tsx`, `tests/projects.spec.ts`

**Interfaces:**
- Consumes: `ProjectDeck` (`slideTypes.ts`), `ReferralPipeline` (B-1).
- Produces: `DECKS['referral-outbound-center']`.

- [ ] **Step 1: Update the unit test** — in `src/windows/ProjectsDeck.test.tsx`, the "Next steps through a stack card by card" test currently walks into Referral expecting `card 1 of 5`. Referral becomes typed. Rewrite that test to walk contents → Work divider → Provider Directory (5 slides) → Referral Outbound Center (title slide) and assert:

```tsx
test('Next walks through the Provider deck, then into the Referral deck', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // Work divider
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // Provider slide 1
  for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // slides 2..5
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' })) // -> Referral slide 1
  expect(
    screen.getByRole('heading', { level: 2, name: 'Referral Outbound Center' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/slide 1 of/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it — expect FAIL** (Referral still markdown → renders `card 1 of 5`, and the walk count lands wrong).

- [ ] **Step 3: Create `src/windows/deck/decks/referral-outbound-center.ts`**

```ts
import type { ProjectDeck } from '../slideTypes'

const referralOutboundCenter: ProjectDeck = {
  slug: 'referral-outbound-center',
  title: 'Referral Outbound Center',
  slides: [
    {
      layout: 'title',
      kicker: 'ExaCare · first project',
      title: 'Referral Outbound Center',
      subtitle: 'An idea to a piloted product — owned end to end.',
    },
    {
      layout: 'points',
      title: 'The problem',
      items: [
        { icon: 'split', text: 'Outbound referrals from sender facilities were manual and hard to track.' },
        { icon: 'eye', text: 'No single place to send, monitor and follow up — referrals could quietly drop.' },
      ],
    },
    {
      layout: 'diagram',
      name: 'ReferralPipeline',
      title: 'The approach',
      caption:
        'Built end to end — the sender-facing flow, the service behind it, and the tracking that makes a referral’s state legible at a glance. Scoped tight so it could ship in about a month and then be corrected with real pilot feedback.',
    },
    {
      layout: 'stat',
      value: '25+',
      label: 'sender facilities in the pilot, at 100% retention over the pilot window',
      foot: 'Proof of concept to launch in roughly a month',
    },
    {
      layout: 'tech',
      title: 'Built with',
      items: ['React', 'Backend service', 'Workflow / queue design'],
    },
  ],
}

export default referralOutboundCenter
```

- [ ] **Step 4: Register in `src/windows/deck/decks/index.ts`**

```ts
import providerDirectory from './provider-directory'
import referralOutboundCenter from './referral-outbound-center'

export const DECKS: Record<string, ProjectDeck> = {
  [providerDirectory.slug]: providerDirectory,
  [referralOutboundCenter.slug]: referralOutboundCenter,
}
```

- [ ] **Step 5: Check `tests/projects.spec.ts`** — "deep link `?open=projects&stack=referral...`" asserts `heading level 2 'Referral Outbound Center'`, which the title slide provides — should still pass. Run the full gate (`npx tsc --noEmit && npm test -- --run && npm run build && npm run prerender:assert && npm run test:e2e`). Fix any drift, screenshot the new deck.

- [ ] **Step 6: Commit**
```bash
git add src/windows/deck/decks/referral-outbound-center.ts src/windows/deck/decks/index.ts src/windows/ProjectsDeck.test.tsx
git commit -m "feat: Referral Outbound Center presentation deck"
```

---

# Sub-plan D · Crisis Detection deck

### Task D-1: `crisis-detection.ts` + test updates

**Files:**
- Create: `src/windows/deck/decks/crisis-detection.ts`
- Modify: `src/windows/deck/decks/index.ts`, `src/windows/ProjectsDeck.test.tsx` (if any assertion touches Crisis rendering), `tests/projects.spec.ts` (the Terminal-jump test)

**Interfaces:**
- Consumes: `ProjectDeck`, `RecallVsCost` (B-2).
- Produces: `DECKS['crisis-detection']`.

- [ ] **Step 1: Update `tests/projects.spec.ts`** — the "Terminal `projects crisis` jumps the deck to that stack" test asserts `heading level 2 'Mental Health Crisis Detection'`. The title slide provides it; keep the assertion but add one for the typed counter:

```ts
await expect(
  page.getByRole('dialog', { name: /projects/i }).getByRole('heading', {
    level: 2,
    name: 'Mental Health Crisis Detection',
  }),
).toBeVisible()
await expect(page.getByRole('dialog', { name: /projects/i }).getByText(/slide 1 of/i)).toBeVisible()
```

- [ ] **Step 2: Run — expect FAIL** (Crisis still markdown; no `slide N of` text).

- [ ] **Step 3: Create `src/windows/deck/decks/crisis-detection.ts`**

```ts
import type { ProjectDeck } from '../slideTypes'

// NOTE: the Result is still `___` in content/projects/crisis-detection.md.
// When Samuel fills it, replace the 'evaluation in progress' slide below with a
// { layout: 'stat', value: <headline metric>, label: <dataset>, foot: <one change> }.
const crisisDetection: ProjectDeck = {
  slug: 'crisis-detection',
  title: 'Mental Health Crisis Detection',
  slides: [
    {
      layout: 'title',
      kicker: 'Side project',
      title: 'Mental Health Crisis Detection',
      subtitle: 'A problem where the false negative is the expensive one.',
    },
    {
      layout: 'points',
      title: 'The problem',
      items: [
        { icon: 'eye', text: 'Crisis signals in free text are easy for a person to skim past and hard to triage at volume.' },
        { icon: 'flag', text: 'Missing one matters more than a handful of false alarms.' },
      ],
    },
    {
      layout: 'diagram',
      name: 'RecallVsCost',
      title: 'The approach',
      caption:
        'A text classifier on a RoBERTa encoder, tuned for recall on the crisis class and evaluated on public datasets so the numbers mean something outside my own test set.',
    },
    {
      layout: 'points',
      title: 'Results',
      items: [
        { icon: 'refresh', text: 'Evaluation on public datasets is in progress — headline numbers written up in the full detail once they are ones I would stand behind.' },
      ],
    },
    {
      layout: 'tech',
      title: 'Built with',
      items: ['Python', 'RoBERTa', 'NLP / text classification'],
    },
  ],
}

export default crisisDetection
```

- [ ] **Step 4: Register in `decks/index.ts`**, run the full gate, screenshot.

- [ ] **Step 5: Commit**
```bash
git add src/windows/deck/decks/crisis-detection.ts src/windows/deck/decks/index.ts tests/projects.spec.ts
git commit -m "feat: Crisis Detection presentation deck (honest 'results in progress' slide)"
```

---

# Sub-plan E · "Full write-up" reading window

### Task E-1: `writeup` window id + `WriteupWindow`

**Files:**
- Modify: `src/shell/windows.ts`, `src/windows/projectsContent.tsx`
- Create: `src/windows/WriteupWindow.tsx`, `src/windows/WriteupWindow.test.tsx`

**Interfaces:**
- Produces: `WindowId` includes `'writeup'`; `DEFAULTS.writeup`; `WriteupWindow({ slug }: { slug: string })`.
- Consumes: `ProjectSection` (newly exported from `projectsContent.tsx`), `projects` data.

- [ ] **Step 1: Write `src/windows/WriteupWindow.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WriteupWindow from './WriteupWindow'

describe('WriteupWindow', () => {
  it('renders the full markdown detail for one project', () => {
    render(<WriteupWindow slug="provider-directory" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Problem' })).toBeInTheDocument()
    expect(screen.getByText(/40,000\+ rows across six rosters/i)).toBeInTheDocument()
  })
  it('falls back to the first project for an unknown slug', () => {
    render(<WriteupWindow slug="nope" />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL** (module missing).

- [ ] **Step 3: Export `ProjectSection`** — in `src/windows/projectsContent.tsx` change `function ProjectSection` to `export function ProjectSection`.

- [ ] **Step 4: Create `src/windows/WriteupWindow.tsx`**

```tsx
import { projects } from '../content/projects'
import { ProjectSection } from './projectsContent'
import styles from './ResumeWindow.module.css'

const ALL = [...projects.work, ...projects.side]

export default function WriteupWindow({ slug }: { slug: string }) {
  const project = ALL.find((p) => p.slug === slug) ?? ALL[0]
  return (
    <div className={styles.scroll}>
      <ProjectSection project={project} />
    </div>
  )
}
```

- [ ] **Step 5: Add the window id** — in `src/shell/windows.ts`: `WindowId` union `+ | 'writeup'`; `DEFAULTS.writeup = { x: 200, y: 90, w: 460, h: 520 }`; `make('writeup')` in `initialDesktop`. Run `npm test -- --run src/windows/WriteupWindow.test.tsx && npx tsc --noEmit` (Desktop's `TITLES` / `content` will fail tsc — fixed in E-2; if blocking, do E-2 Step 3's Desktop edits now).

- [ ] **Step 6: Commit**
```bash
git add src/shell/windows.ts src/windows/projectsContent.tsx src/windows/WriteupWindow.tsx src/windows/WriteupWindow.test.tsx
git commit -m "feat: WriteupWindow — one project's full markdown detail"
```

### Task E-2: Wire "Full write-up" into the deck

**Files:**
- Modify: `src/windows/ProjectsDeck.tsx`, `src/windows/ProjectsWindow.tsx`, `src/shell/Desktop.tsx`, `src/windows/ProjectsDeck.test.tsx`
- Create: `tests/writeup.spec.ts`

**Interfaces:**
- `ProjectsDeck` / `ProjectsWindow` gain `onOpenWriteup?: (slug: string) => void`.
- `Desktop` holds `writeupSlug` state; `content.writeup = <WriteupWindow slug={writeupSlug} />`; passes `onOpenWriteup` into `content.projects`.

- [ ] **Step 1: Add the unit test** to `src/windows/ProjectsDeck.test.tsx`

```tsx
test('the Full write-up link calls onOpenWriteup with the current project slug', async () => {
  const onOpenWriteup = vi.fn()
  render(<ProjectsDeck data={projects} target={{ slug: 'provider-directory', nonce: 1 }} onOpenWriteup={onOpenWriteup} />)
  await userEvent.click(screen.getByRole('button', { name: /full write-up/i }))
  expect(onOpenWriteup).toHaveBeenCalledWith('provider-directory')
})

test('no Full write-up link on the contents or divider slides', () => {
  render(<ProjectsDeck data={projects} target={null} onOpenWriteup={() => {}} />)
  expect(screen.queryByRole('button', { name: /full write-up/i })).toBeNull()
})
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Edit `src/windows/ProjectsDeck.tsx`** — add the prop and render the link in the nav bar when `project` is set:

```tsx
export default function ProjectsDeck({
  data,
  target,
  onOpenWriteup,
}: {
  data: ProjectsData
  target: { slug: string; nonce: number } | null
  onOpenWriteup?: (slug: string) => void
}) {
```

  In the `.nav` block, after the `count` span:

```tsx
{project && onOpenWriteup && (
  <button className={styles.writeup} onClick={() => onOpenWriteup(project.slug)}>
    Full write-up →
  </button>
)}
```

  `ProjectsDeck.module.css` — add `.writeup { margin-left: 12px; font-family: var(--chrome-font); border: 1px solid var(--c-fg); padding: 2px 8px; }` and `.writeup:hover, .writeup:focus-visible { background: var(--c-accent); color: var(--c-accent-fg); }`. (Note: `.count` has `margin-left: auto`; keep `.writeup` after it so both sit right. If `project` is null the count is absent — the link is too, so no layout gap.)

- [ ] **Step 4: Thread through `src/windows/ProjectsWindow.tsx`**

```tsx
export default function ProjectsWindow({
  target,
  onOpenWriteup,
}: {
  target: { slug: string; nonce: number } | null
  onOpenWriteup?: (slug: string) => void
}) {
  return <ProjectsDeck data={projects} target={target} onOpenWriteup={onOpenWriteup} />
}
```

- [ ] **Step 5: Wire `src/shell/Desktop.tsx`**
  - `import WriteupWindow from '../windows/WriteupWindow'`
  - `TITLES.writeup = 'Project Notes'`
  - `const [writeupSlug, setWriteupSlug] = useState('provider-directory')`
  - `content.projects`: `<ProjectsWindow target={stackTarget} onOpenWriteup={(slug) => { setWriteupSlug(slug); dispatch({ type: 'open', id: 'writeup' }) }} />`
  - `content.writeup`: `<WriteupWindow slug={writeupSlug} />`

- [ ] **Step 6: Write `tests/writeup.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/?open=projects&stack=provider-directory')
  await page.getByText('Welcome to Macintosh').waitFor({ state: 'detached', timeout: 6000 }).catch(() => {})
  await expect(page.getByRole('dialog', { name: /projects/i })).toBeVisible()
}

test('Full write-up opens the project detail in its own window', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: /full write-up/i }).click()
  const notes = page.getByRole('dialog', { name: 'Project Notes' })
  await expect(notes.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
  await expect(notes.getByText(/40,000\+ rows across six rosters/i)).toBeVisible()
})
```

- [ ] **Step 7: Full gate + commit**
```bash
npx tsc --noEmit && npm test -- --run && npm run build && npm run prerender:assert && npm run test:e2e
git add -A
git commit -m "feat: Full write-up link opens a project's markdown detail in a window"
```

---

## Self-Review

**Spec coverage:**
- Layout polish (centre column, ReconcileLoop de-collide) → A-1, A-2. ✓
- Diagram library (`ReferralPipeline`, `RecallVsCost`) → B-1, B-2. ✓
- Referral deck → C-1. Crisis deck (honest results slide + swap-in comment) → D-1. ✓
- Fitness Bot: no deck, keeps its markdown placeholder card → no task needed (fallback path is unchanged). ✓
- Full write-up affordance + reading window → E-1, E-2. ✓
- No `content/projects/*.md` change, no `ProjectsArticle` fallback change → respected (E-1 only *exports* `ProjectSection`). ✓
- Out of scope (résumé/readme viz, filling Crisis/Fitness content) → no tasks. ✓

**Placeholder scan:** the diagram tasks (A-2, B-1, B-2) each carry a full component and an explicit "build + screenshot + nudge coordinates" step — that is the correct verification for pixel layout, not a TODO. No bare "write tests".

**Type consistency:**
- `DiagramName` extended once (B-1 Step 1) to the full `'ReconcileLoop' | 'ReferralPipeline' | 'RecallVsCost'`; `DIAGRAMS` gains both keys across B-1/B-2 — B-1 Step 5 notes the ordering hazard and the fix.
- `DECKS` keys by `slug`; `decks.test.ts` (already shipped) asserts `deck.slug === key` and `slides[0].layout === 'title'` with matching title — the new decks satisfy this by construction.
- `onOpenWriteup?: (slug: string) => void` — same signature in `ProjectsDeck`, `ProjectsWindow`, and the `Desktop` call site (E-2).
- `WindowId` gains `'writeup'` in E-1; `TITLES` / `DEFAULTS` / `content` / `make()` all updated (E-1 Step 5 + E-2 Step 5) — E-1 Step 5 flags the tsc dependency on E-2's Desktop edits.
- Counter label: `deck ? 'slide' : 'card'` — already in `ProjectsDeck` from the slice; the updated tests assert `/slide N of M/`.

**Ordering:** do sub-plans A→E in order. Within B, if `tsc` blocks B-1 on the missing `RecallVsCost` key, add B-2's component stub first. Within E, if `tsc` blocks E-1 on `Desktop`'s `TITLES`/`content`, apply E-2 Step 5's Desktop edits before finishing E-1.
