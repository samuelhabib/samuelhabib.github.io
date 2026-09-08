# Portfolio v2 — Plan 3-A: Projects Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `Projects` window that presents Samuel's projects as a guided Keynote/HyperCard-style **deck** — a contents slide, a "Work" divider, the ExaCare work stacks, an "Outside of Work Projects" divider, then the side-project stacks — each stack a sequence of cards (Overview → Problem → Approach → Result → Tech & Links). The same project content also ships as real semantic HTML in `#main` for the no-JS / mobile / screen-reader view. Openable from the desktop icon, from `?open=projects&stack=<slug>`, and from a Terminal `projects` command.

**Architecture:** Four content files under `content/projects/` are the source of truth, each parsed at build (front matter for metadata, `##` headings for cards) into a typed `ProjectsData` — same pattern as `src/content/resume.ts` / `about.ts`. A pure `ProjectsArticle` renders the whole set as a stacked document (consumed by the `#main` fallback, gated by `scripts/assert-prerendered.mjs`). An interactive `ProjectsDeck` renders one card at a time with Prev / Next / Home navigation and a "card N of M" indicator; slide changes are **instant** (a dithered dissolve transition is deliberately out of scope — see Deferred). `Desktop` mounts the deck as the `projects` window, handles the `?open=projects&stack=` deep link, and exposes `openStack(slug)` on the Terminal bridge so `projects crisis` jumps straight to a stack.

**Tech Stack:** React 18, TypeScript 5, `marked` (already a dependency, used by `about.ts`), Vitest + @testing-library/react (unit), Playwright + @axe-core/playwright (e2e). No new dependencies. Reuses the Plan 1 `Window` chrome / `windowsReducer` and the Plan 2 Terminal `DesktopBridge`.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-v2-classic-mac-design.md` — the "Projects — HyperCard stacks + Keynote-style dividers" section under Structure / windows, plus "Content model" and "Mobile / no-JS fallback".

## Global Constraints

Every task's requirements implicitly include these. Values copied from the spec or carried forward from Plans 1–2.

- **Strictly 1-bit.** Only `#000` / `#fff`, via the existing tokens (`--black`, `--white`). No greys except the Plan 1 dither utilities. **No `opacity` for de-emphasis or disabled states** (a Plan 2 review finding) — use `line-through`, italics, borders, or invert. Interaction feedback is a full invert.
- **Real static HTML.** All project content ships as real semantic HTML inside `#main` via `ProjectsArticle`. `scripts/assert-prerendered.mjs` gains its first new needle since Plan 1 — it must point at a **work** stack (`Provider Directory`), never at `crisis-detection.md` or `fitness-bot.md`, whose prose Samuel will revise.
- **Heading levels.** `#main` already has `<h1>` (résumé name) + `<h2>`s (résumé) + `<h1>` (Read Me). `ProjectsArticle` and `ProjectsDeck` use **`<h2>` for a project title** and **`<h3>` for a card heading**. Never emit an `<h1>` from projects code — `tests/a11y.spec.ts` fails the build on heading-order / duplicate-h1 regressions.
- **`content/projects/*.md` is trusted, repo-authored content.** Card HTML is produced by `marked` from those files and injected with `dangerouslySetInnerHTML` — same trust model as `readmeContent.tsx`. Keep a "trusted content, no user input" comment at every injection site.
- **No fake features / no invented specifics.** The two ExaCare stacks are written **only** from résumé bullets already public on the site. `crisis-detection.md` is real but its "Result" is a `___ (Samuel to fill in: …)` marker — the exact convention from `content/about.md` — because the numbers aren't sourced. `fitness-bot.md` is a flagged placeholder (`placeholder: true`).
- **Desktop shell only.** The deck is part of the `≥768px` hydrated desktop; below 768px `#main` (which includes `#projects`) is the view. `tests/mobile.spec.ts` enforces "no `projects` dialog under 768px".
- **`prefers-reduced-motion`** — the deck has no motion in this plan; do not add any.
- **Vite `base: '/'`.** Static assets (the one card diagram) live in `public/projects/` and are referenced as `/projects/...`.

---

## File Structure

**Content (Task 1)**
- `content/projects/provider-directory.md` — work stack, from the résumé's Provider Directory bullet
- `content/projects/referral-outbound-center.md` — work stack, from the résumé's Referral Outbound Center bullet
- `content/projects/crisis-detection.md` — side stack, real, Result is a fill-in marker
- `content/projects/fitness-bot.md` — side stack, flagged placeholder
- `public/projects/provider-directory-flow.svg` — one 1-bit card diagram
- `src/content/projectTypes.ts` — `Project`, `ProjectCard`, `ProjectLink`, `ProjectsData`
- `src/content/projects.ts` — four explicit `?raw` imports → `parseProject` → `projects: ProjectsData`; `findProject(data, query)`

**Pre-rendered article + fallback (Task 2)**
- `src/windows/projectsContent.tsx` — `ProjectsArticle({ data })`, pure semantic render
- `src/App.tsx` — add `#projects` to the `#main` fallback + a nav link
- `src/styles/fallback.css`, `src/styles/print.css` — extend for `#projects`
- `scripts/assert-prerendered.mjs` — add the `Provider Directory` needle

**Interactive deck (Task 3)**
- `src/windows/ProjectsDeck.tsx` + `src/windows/ProjectsDeck.module.css` — slide/card model, nav, keyboard, `target` jump

**Desktop / deep link / terminal (Task 4)**
- `src/windows/ProjectsWindow.tsx` — thin wrapper: `<ProjectsDeck data={projects} target={target} />`
- `src/shell/Desktop.tsx` — mount `projects`, deep-link effect, `openStack` on the bridge
- `src/terminal/types.ts` — `DesktopBridge` gains `openStack(slug)`
- `src/terminal/commands.tsx` — `projects` command; `projects` added to `OPENABLE`
- `src/terminal/useTerminal.tsx` — pass `openStack` through `ctx`

**Tests**
- `src/content/projects.test.ts`, `src/windows/projectsContent.test.tsx`, `src/windows/ProjectsDeck.test.tsx`
- `tests/projects.spec.ts` (new), `tests/mobile.spec.ts` (extend), `src/terminal/run.test.tsx` (adjust one case)

---

### Task 1: Projects content pipeline

**Files:**
- Create: `content/projects/provider-directory.md`, `content/projects/referral-outbound-center.md`, `content/projects/crisis-detection.md`, `content/projects/fitness-bot.md`
- Create: `public/projects/provider-directory-flow.svg`
- Create: `src/content/projectTypes.ts`
- Create: `src/content/projects.ts`
- Test: `src/content/projects.test.ts`

**Interfaces:**
- Consumes: `parseFrontmatter` from `src/content/frontmatter.ts`; `marked`.
- Produces:
  ```ts
  // src/content/projectTypes.ts
  export interface ProjectLink { label: string; href: string }
  export type ProjectCard =
    | { kind: 'prose'; heading: string; html: string }
    | { kind: 'techlinks'; heading: string; tech: string[]; links: ProjectLink[] }
  export interface Project {
    slug: string
    title: string
    group: 'work' | 'side'
    order: number
    placeholder: boolean
    summary: string
    tech: string[]
    links: ProjectLink[]
    cards: ProjectCard[]        // [Overview?, ...## sections, TechLinks?]
    rawMarkdown: string
  }
  export interface ProjectsData { work: Project[]; side: Project[] }   // each sorted by `order`
  ```
  ```ts
  // src/content/projects.ts
  export const projects: ProjectsData
  export function findProject(data: ProjectsData, query: string): Project | undefined
  // exact slug match first, then first slug that includes the lowercased query
  ```

- [x] **Step 1: Write `content/projects/provider-directory.md`**

```markdown
---
title: Provider Directory
slug: provider-directory
group: work
order: 1
summary: An ingestion pipeline that turns six disagreeing public rosters into one directory that repairs itself every week.
tech:
  - Python
  - PostgreSQL
  - Public CMS / NPI data
  - Scheduled reconciliation
links:
  - label: Resume (PDF)
    href: /Resume.pdf
---

I self-scoped this one at ExaCare after seeing how much manual cleanup our provider data needed.

## Problem

Provider information lives in public sources — CMS, the NPI registry, plan rosters — that disagree with each other, go stale, and move. Six rosters, 40,000+ rows, no single source of truth. Features that needed "which providers are real and reachable" were reading whatever snapshot happened to be loaded.

## Approach

One ingestion pipeline over the public feeds, normalizing each roster into a shared shape, then a weekly reconciliation job that diffs the live sources against our directory and repairs the drift on its own — new records, retired NPIs, changed affiliations — instead of waiting for someone to notice.

![Six rosters reconciled into one directory](/projects/provider-directory-flow.svg)

## Result

40,000+ rows across six rosters kept current without a human in the loop. The reconciliation runs weekly and self-heals; the directory stopped being something anyone has to babysit.
```

- [x] **Step 2: Write `content/projects/referral-outbound-center.md`**

```markdown
---
title: Referral Outbound Center
slug: referral-outbound-center
group: work
order: 2
summary: Owned end to end, from proof of concept to launch in about a month, piloting with 25+ sender facilities.
tech:
  - React
  - Backend service
  - Workflow / queue design
links:
  - label: Resume (PDF)
    href: /Resume.pdf
---

My first project at ExaCare — taken from an idea to a piloted product.

## Problem

Outbound referrals from sender facilities were a manual, hard-to-track process. The goal was one place to send, monitor, and follow up on referrals without dropping any.

## Approach

Built it end to end: the sender-facing flow, the service behind it, and the tracking that makes a referral's state legible at a glance. Scoped tight so it could ship in about a month and then be corrected with real pilot feedback.

## Result

Launched to a pilot of 25+ sender facilities at a 100% retention rate over the pilot window. Proof of concept to launch in roughly a month.
```

- [x] **Step 3: Write `content/projects/crisis-detection.md`**

```markdown
---
title: Mental Health Crisis Detection
slug: crisis-detection
group: side
order: 1
summary: An NLP classifier that flags crisis signals in short text, so the ones that matter don't get missed.
tech:
  - Python
  - RoBERTa
  - NLP / text classification
links: []
---

A side project on a problem where the false negative is the expensive one.

## Problem

Crisis signals in free text — forum posts, messages, journal entries — are easy for a person to skim past and hard to triage at volume. Missing one matters more than a handful of false alarms.

## Approach

A text classifier built on a RoBERTa encoder, tuned for recall on the crisis class and evaluated on public datasets so the numbers mean something outside my own test set.

## Result

___ (Samuel to fill in: which dataset, the headline metric you'd stand behind, and one thing you'd change.)
```

- [x] **Step 4: Write `content/projects/fitness-bot.md`**

```markdown
---
title: AI Fitness & Calorie Bot
slug: fitness-bot
group: side
order: 2
placeholder: true
summary: A conversational assistant for logging food and workouts. Not written up yet.
tech: []
links: []
---

## Placeholder

This stack is a placeholder. The project is real, but I haven't written it up — dropping in invented specifics would be worse than leaving it blank.

___ (Samuel to fill in: what it does, what's actually built, and why you started it.)
```

- [x] **Step 5: Write `public/projects/provider-directory-flow.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 220" role="img" aria-label="Six public rosters flow into a weekly reconciliation step and out to one directory">
  <rect width="480" height="220" fill="#fff"/>
  <g fill="none" stroke="#000" stroke-width="2">
    <rect x="12" y="14" width="96" height="24"/>
    <rect x="12" y="46" width="96" height="24"/>
    <rect x="12" y="78" width="96" height="24"/>
    <rect x="12" y="110" width="96" height="24"/>
    <rect x="12" y="142" width="96" height="24"/>
    <rect x="12" y="174" width="96" height="24"/>
    <rect x="196" y="82" width="108" height="56"/>
    <rect x="372" y="82" width="96" height="56"/>
    <path d="M108 26 H150 M108 58 H150 M108 90 H150 M108 122 H150 M108 154 H150 M108 186 H150 M150 26 V186 M150 106 H196"/>
    <path d="M304 110 H372"/>
    <path d="M420 138 V196 H250 V138" stroke-dasharray="4 4"/>
  </g>
  <g font-family="monospace" font-size="11" fill="#000">
    <text x="24" y="30">roster 1</text>
    <text x="24" y="62">roster 2</text>
    <text x="24" y="94">roster 3</text>
    <text x="24" y="126">roster 4</text>
    <text x="24" y="158">roster 5</text>
    <text x="24" y="190">roster 6</text>
    <text x="210" y="106">reconcile</text>
    <text x="210" y="122">(weekly)</text>
    <text x="388" y="114">directory</text>
    <text x="256" y="212">self-heal</text>
  </g>
</svg>
```

- [x] **Step 6: Write the failing test**

```ts
// src/content/projects.test.ts
import { projects, findProject } from './projects'

test('loads all four project files, split into work and side by front matter', () => {
  expect(projects.work.map((p) => p.slug)).toEqual(['provider-directory', 'referral-outbound-center'])
  expect(projects.side.map((p) => p.slug)).toEqual(['crisis-detection', 'fitness-bot'])
})

test('cards are assembled: Overview lead, ## sections, then a Tech & Links card', () => {
  const pd = projects.work[0]
  const headings = pd.cards.map((c) => c.heading)
  expect(headings).toEqual(['Overview', 'Problem', 'Approach', 'Result', 'Tech & Links'])
  const last = pd.cards[pd.cards.length - 1]
  expect(last.kind).toBe('techlinks')
  if (last.kind === 'techlinks') {
    expect(last.tech).toContain('PostgreSQL')
    expect(last.links[0]).toEqual({ label: 'Resume (PDF)', href: '/Resume.pdf' })
  }
})

test('prose cards carry rendered HTML', () => {
  const problem = projects.work[0].cards.find((c) => c.heading === 'Problem')
  expect(problem?.kind).toBe('prose')
  if (problem?.kind === 'prose') expect(problem.html).toMatch(/<p>.*40,000\+ rows.*<\/p>/s)
})

test('a project with no lead paragraph has no Overview card', () => {
  const fb = projects.side.find((p) => p.slug === 'fitness-bot')!
  expect(fb.cards.map((c) => c.heading)).toEqual(['Placeholder'])
  expect(fb.placeholder).toBe(true)
})

test('non-placeholder projects are not flagged', () => {
  expect(projects.work.every((p) => p.placeholder === false)).toBe(true)
  expect(findProject(projects, 'crisis-detection')!.placeholder).toBe(false)
})

test('findProject matches an exact slug, then a partial', () => {
  expect(findProject(projects, 'referral-outbound-center')!.slug).toBe('referral-outbound-center')
  expect(findProject(projects, 'crisis')!.slug).toBe('crisis-detection')
  expect(findProject(projects, 'nope')).toBeUndefined()
})
```

- [x] **Step 7: Run it to verify it fails**

Run: `npm test -- src/content/projects`
Expected: FAIL — `Cannot find module './projects'`.

- [x] **Step 8: Implement `projectTypes.ts`**

```ts
// src/content/projectTypes.ts
export interface ProjectLink {
  label: string
  href: string
}

export type ProjectCard =
  | { kind: 'prose'; heading: string; html: string }
  | { kind: 'techlinks'; heading: string; tech: string[]; links: ProjectLink[] }

export interface Project {
  slug: string
  title: string
  group: 'work' | 'side'
  order: number
  placeholder: boolean
  summary: string
  tech: string[]
  links: ProjectLink[]
  cards: ProjectCard[]
  rawMarkdown: string
}

export interface ProjectsData {
  work: Project[]
  side: Project[]
}
```

- [x] **Step 9: Implement `projects.ts`**

```ts
// src/content/projects.ts
import { marked } from 'marked'
import { parseFrontmatter } from './frontmatter'
import type { Project, ProjectCard, ProjectLink, ProjectsData } from './projectTypes'
import providerDirectory from '../../content/projects/provider-directory.md?raw'
import referralOutboundCenter from '../../content/projects/referral-outbound-center.md?raw'
import crisisDetection from '../../content/projects/crisis-detection.md?raw'
import fitnessBot from '../../content/projects/fitness-bot.md?raw'

// Four explicit ?raw imports rather than import.meta.glob: proven to work in
// this codebase (resume.ts / about.ts), zero SSG risk, and the list is short.
// Adding a project = add an import and an array entry.
const RAW = [providerDirectory, referralOutboundCenter, crisisDetection, fitnessBot]

function splitSections(body: string): {
  lead: string
  items: { heading: string; body: string }[]
} {
  const parts = body.split(/^## +/m)
  const lead = (parts.shift() ?? '').trim()
  const items = parts.map((p) => {
    const nl = p.indexOf('\n')
    const heading = (nl === -1 ? p : p.slice(0, nl)).trim()
    const rest = (nl === -1 ? '' : p.slice(nl + 1)).trim()
    return { heading, body: rest }
  })
  return { lead, items }
}

function parseProject(raw: string): Project {
  const { data, content } = parseFrontmatter(raw)
  const { lead, items } = splitSections(content)
  const tech = (data.tech ?? []) as string[]
  const links = (data.links ?? []) as ProjectLink[]

  const cards: ProjectCard[] = []
  if (lead) cards.push({ kind: 'prose', heading: 'Overview', html: marked.parse(lead) as string })
  for (const s of items) {
    cards.push({ kind: 'prose', heading: s.heading, html: marked.parse(s.body) as string })
  }
  if (tech.length || links.length) {
    cards.push({ kind: 'techlinks', heading: 'Tech & Links', tech, links })
  }

  return {
    slug: String(data.slug ?? ''),
    title: String(data.title ?? ''),
    group: data.group === 'side' ? 'side' : 'work',
    order: Number(data.order ?? 0),
    placeholder: data.placeholder === true,
    summary: String(data.summary ?? '').trim(),
    tech,
    links,
    cards,
    rawMarkdown: content.trim(),
  }
}

const all = RAW.map(parseProject)
const byOrder = (a: Project, b: Project) => a.order - b.order

export const projects: ProjectsData = {
  work: all.filter((p) => p.group === 'work').sort(byOrder),
  side: all.filter((p) => p.group === 'side').sort(byOrder),
}

export function findProject(data: ProjectsData, query: string): Project | undefined {
  const q = query.toLowerCase().trim()
  const flat = [...data.work, ...data.side]
  return (
    flat.find((p) => p.slug.toLowerCase() === q) ??
    flat.find((p) => p.slug.toLowerCase().includes(q))
  )
}
```

- [x] **Step 10: Run the test to verify it passes**

Run: `npm test -- src/content/projects`
Expected: PASS (all six).

- [x] **Step 11: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [x] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: projects content pipeline (4 stacks parsed to typed ProjectsData)"
```

---

### Task 2: `ProjectsArticle` and the no-JS / mobile / print / prerender wiring

**Files:**
- Create: `src/windows/projectsContent.tsx`
- Test: `src/windows/projectsContent.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/fallback.css`
- Modify: `src/styles/print.css`
- Modify: `scripts/assert-prerendered.mjs`
- Create: `tests/projects.spec.ts`
- Modify: `tests/mobile.spec.ts`

**Interfaces:**
- Consumes: `ProjectsData`, `Project` from `src/content/projectTypes.ts`; `projects` from `src/content/projects.ts`.
- Produces: `ProjectsArticle({ data }: { data: ProjectsData })` — a pure `<article className="projects">` with a top `<h2>Projects</h2>`, then per project (work then side) a `<section>` with `<h2>` title, an optional placeholder `<p>`, a summary `<p>`, and one `<section><h3>…` per card (prose cards inject `card.html`; the tech/links card renders real `<strong>` + `<ul><li><a>`). No shell chrome, no interactivity. This is what SSG emits and `assert-prerendered.mjs` guards.

- [x] **Step 1: Write the failing content test**

```tsx
// src/windows/projectsContent.test.tsx
import { render, screen } from '@testing-library/react'
import { ProjectsArticle } from './projectsContent'
import { projects } from '../content/projects'

test('renders every project as an h2 with h3 card headings', () => {
  render(<ProjectsArticle data={projects} />)
  const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  expect(h2s).toContain('Provider Directory')
  expect(h2s).toContain('Mental Health Crisis Detection')
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toContain('Problem')
})

test('renders no h1 (the document already has one)', () => {
  render(<ProjectsArticle data={projects} />)
  expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
})

test('renders prose card HTML and the tech/links list', () => {
  render(<ProjectsArticle data={projects} />)
  expect(screen.getByText(/40,000\+ rows across six rosters/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /resume \(pdf\)/i })).toHaveAttribute('href', '/Resume.pdf')
})

test('flags the placeholder project', () => {
  render(<ProjectsArticle data={projects} />)
  expect(screen.getByText(/placeholder — not yet written/i)).toBeInTheDocument()
})
```

- [x] **Step 2: Run to verify it fails**

Run: `npm test -- projectsContent`
Expected: FAIL — module not found.

- [x] **Step 3: Implement `projectsContent.tsx`**

```tsx
// src/windows/projectsContent.tsx
import type { Project, ProjectsData } from '../content/projectTypes'

function ProjectSection({ project }: { project: Project }) {
  return (
    <section className="project" id={`project-${project.slug}`}>
      <h2>{project.title}</h2>
      {project.placeholder && <p className="project-flag">Placeholder — not yet written</p>}
      <p className="project-summary">{project.summary}</p>
      {project.cards.map((card, i) =>
        card.kind === 'prose' ? (
          <section key={i}>
            <h3>{card.heading}</h3>
            {/* HTML from our own trusted content/projects/*.md via marked; no user input */}
            <div dangerouslySetInnerHTML={{ __html: card.html }} />
          </section>
        ) : (
          <section key={i}>
            <h3>{card.heading}</h3>
            {card.tech.length > 0 && (
              <p>
                <strong>Tech:</strong> {card.tech.join(', ')}
              </p>
            )}
            {card.links.length > 0 && (
              <ul>
                {card.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ),
      )}
    </section>
  )
}

export function ProjectsArticle({ data }: { data: ProjectsData }) {
  return (
    <article className="projects">
      <h2>Projects</h2>
      {[...data.work, ...data.side].map((p) => (
        <ProjectSection key={p.slug} project={p} />
      ))}
    </article>
  )
}
```

- [x] **Step 4: Run the content test to verify it passes**

Run: `npm test -- projectsContent`
Expected: PASS.

- [x] **Step 5: Wire `ProjectsArticle` into the `#main` fallback**

In `src/App.tsx`: add the imports

```tsx
import { projects } from './content/projects'
import { ProjectsArticle } from './windows/projectsContent'
```

Change the nav line to include Projects:

```tsx
        <nav className="doc-nav">
          <a href="#resume">Résumé</a> · <a href="#readme">Read Me</a> ·{' '}
          <a href="#projects">Projects</a>
        </nav>
```

Add a `#projects` block immediately after the `#readme` block:

```tsx
        <div id="readme">
          <ReadMeArticle />
        </div>
        <div id="projects">
          <ProjectsArticle data={projects} />
        </div>
```

- [x] **Step 6: Extend `fallback.css`**

```css
.doc-fallback #resume,
.doc-fallback #readme,
.doc-fallback #projects {
  scroll-margin-top: 48px;
}
.doc-fallback #readme,
.doc-fallback #projects {
  margin-top: 48px;
  border-top: 1px solid var(--black);
  padding-top: 24px;
}
```

(Replace the existing two rules that name only `#resume`/`#readme`.)

- [x] **Step 7: Extend `print.css`**

Change the résumé-only rule to also drop `#projects`:

```css
  /* the PDF is the résumé only */
  #readme,
  #projects {
    display: none;
  }
```

- [x] **Step 8: Add the prerender needle**

In `scripts/assert-prerendered.mjs`, add `'Provider Directory'` to the `needles` array:

```js
const needles = [
  '<h1',
  'Samuel Habib',
  'Referral Outbound Center',
  'Provider Directory',
  'Toronto Metropolitan University',
  'need me watching them',
  'Superpowers workflow',
]
```

- [x] **Step 9: Write the no-JS e2e test**

```ts
// tests/projects.spec.ts
import { test, expect } from '@playwright/test'

test('projects content is in the served HTML (no-JS view)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
  await expect(page.getByText(/40,000\+ rows across six rosters/i).first()).toBeVisible()
  await ctx.close()
})
```

- [x] **Step 10: Extend `tests/mobile.spec.ts`**

Add:

```ts
test('mobile shows the projects section and no projects window', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: /projects/i })).toHaveCount(0)
})
```

- [x] **Step 11: Verify — this is the real SSG check for the content pipeline**

Run: `npm test && npm run build && npm run prerender:assert`
Expected: all green; the `Provider Directory` needle passes, meaning `src/content/projects.ts`'s `?raw` imports and `marked` calls survived the `vite-react-ssg` Node prerender. If the build fails inside `projects.ts`, the fix is contained there (the parser and exports do not change).

Run: `npm run test:e2e -- projects mobile`
Expected: PASS.

- [x] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: pre-rendered ProjectsArticle in #main; no-JS / mobile / print / prerender wiring"
```

---

### Task 3: `ProjectsDeck` — the interactive Keynote/HyperCard deck

**Files:**
- Create: `src/windows/ProjectsDeck.tsx`
- Create: `src/windows/ProjectsDeck.module.css`
- Test: `src/windows/ProjectsDeck.test.tsx`

**Interfaces:**
- Consumes: `ProjectsData`, `Project`, `ProjectCard` from `src/content/projectTypes.ts`.
- Produces: `ProjectsDeck` default export, props:
  ```ts
  interface ProjectsDeckProps {
    data: ProjectsData
    target: { slug: string; nonce: number } | null   // jump-to-stack request; nonce forces re-fire
  }
  ```
  Behaviour:
  - Slide sequence: `[contents, divider("Work"), ...work stacks, divider("Outside of Work Projects"), ...side stacks]`.
  - State: `slideIndex` (`si`), `cardIndex` (`ci`). Every slide change resets `ci` to `0`.
  - `next()` / `prev()`: within a stack, step `ci`; at a stack edge (or on a non-stack slide), step `si`.
  - `home()`: `si = 0`, `ci = 0` (the contents slide).
  - Contents slide: `<h2>Projects</h2>`, a short `<p>`, and a `<button>` per project (work then side) that jumps to that stack; a placeholder project's button is suffixed " (placeholder)".
  - Divider slide: `<h2 className={styles.divider}>{label}</h2>`.
  - Stack slide: `<h2>{project.title}</h2>`, a summary `<p>`, an optional placeholder `<p className={styles.flag}>`, then the current card — prose card = `<h3>{heading}</h3>` + injected `card.html` (trusted-content comment); tech/links card = `<h3>` + `<strong>Tech:</strong>` line + `<ul><li><a>`.
  - Nav bar (always visible): `◀ Prev` (`disabled` at the very start), `Home`, `Next ▶` (`disabled` at the very end), and a right-aligned `card N of M` shown only on stack slides. Disabled buttons use `line-through`, not `opacity`.
  - Root `<div role="group" aria-label="Projects deck" tabIndex={0}>` with `onKeyDown`: `ArrowRight`/`PageDown` → next, `ArrowLeft`/`PageUp` → prev, `Home` → home. (Escape is left to `useWindowKeys`; arrows do not collide with the Terminal because this handler is local to the focused deck.)
  - `useEffect` keyed on `target?.nonce`: when `target` is set, find the stack slide whose `project.slug` exactly equals or includes `target.slug` and set `si` to it, `ci` to `0`.

- [x] **Step 1: Write the failing tests**

```tsx
// src/windows/ProjectsDeck.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import ProjectsDeck from './ProjectsDeck'
import { projects } from '../content/projects'

test('opens on the contents slide with a button per project', () => {
  render(<ProjectsDeck data={projects} target={null} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /provider directory/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /ai fitness & calorie bot \(placeholder\)/i })).toBeInTheDocument()
})

test('Next walks contents → "Work" divider → first work stack at card 1 of M', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Work' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeInTheDocument()
  expect(screen.getByText(/card 1 of 5/i)).toBeInTheDocument()
})

test('Next steps through a stack card by card, then to the next slide', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  // contents -> Work divider -> Provider Directory card 1
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  // 5 cards consumed -> now on Referral Outbound Center card 1
  expect(screen.getByRole('heading', { level: 2, name: 'Referral Outbound Center' })).toBeInTheDocument()
  expect(screen.getByText(/card 1 of/i)).toBeInTheDocument()
})

test('Home returns to the contents slide', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: 'Next ▶' }))
  await userEvent.click(screen.getByRole('button', { name: 'Home' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
})

test('a contents button jumps straight to that stack', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  await userEvent.click(screen.getByRole('button', { name: /mental health crisis detection/i }))
  expect(screen.getByRole('heading', { level: 2, name: 'Mental Health Crisis Detection' })).toBeInTheDocument()
})

test('a new target nonce jumps to that stack', async () => {
  function Harness() {
    const [n, setN] = useState(0)
    return (
      <>
        <button onClick={() => setN((x) => x + 1)}>go</button>
        <ProjectsDeck data={projects} target={n ? { slug: 'referral', nonce: n } : null} />
      </>
    )
  }
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'go' }))
  expect(screen.getByRole('heading', { level: 2, name: 'Referral Outbound Center' })).toBeInTheDocument()
})

test('ArrowRight on the focused deck advances', async () => {
  render(<ProjectsDeck data={projects} target={null} />)
  const deck = screen.getByRole('group', { name: /projects deck/i })
  deck.focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByRole('heading', { level: 2, name: 'Work' })).toBeInTheDocument()
})

test('Prev is disabled on the contents slide', () => {
  render(<ProjectsDeck data={projects} target={null} />)
  expect(screen.getByRole('button', { name: '◀ Prev' })).toBeDisabled()
})
```

- [x] **Step 2: Run to verify they fail**

Run: `npm test -- ProjectsDeck`
Expected: FAIL — module not found.

- [x] **Step 3: Implement `ProjectsDeck.tsx`**

```tsx
// src/windows/ProjectsDeck.tsx
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import type { Project, ProjectCard, ProjectsData } from '../content/projectTypes'
import styles from './ProjectsDeck.module.css'

type Slide =
  | { kind: 'contents' }
  | { kind: 'divider'; label: string }
  | { kind: 'stack'; project: Project }

function buildSlides(data: ProjectsData): Slide[] {
  return [
    { kind: 'contents' },
    { kind: 'divider', label: 'Work' },
    ...data.work.map((project) => ({ kind: 'stack' as const, project })),
    { kind: 'divider', label: 'Outside of Work Projects' },
    ...data.side.map((project) => ({ kind: 'stack' as const, project })),
  ]
}

function Card({ card }: { card: ProjectCard }) {
  if (card.kind === 'prose') {
    return (
      <>
        <h3>{card.heading}</h3>
        {/* HTML from our own trusted content/projects/*.md via marked; no user input */}
        <div dangerouslySetInnerHTML={{ __html: card.html }} />
      </>
    )
  }
  return (
    <>
      <h3>{card.heading}</h3>
      {card.tech.length > 0 && (
        <p>
          <strong>Tech:</strong> {card.tech.join(', ')}
        </p>
      )}
      {card.links.length > 0 && (
        <ul>
          {card.links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function ProjectsDeck({
  data,
  target,
}: {
  data: ProjectsData
  target: { slug: string; nonce: number } | null
}) {
  const slides = useMemo(() => buildSlides(data), [data])
  const [si, setSi] = useState(0)
  const [ci, setCi] = useState(0)

  const slide = slides[si]
  const stackCards = slide.kind === 'stack' ? slide.project.cards : []
  const cardCount = Math.max(stackCards.length, 1)
  const card = slide.kind === 'stack' ? stackCards[Math.min(ci, cardCount - 1)] : null

  const atStart = si === 0 && ci === 0
  const atEnd =
    si === slides.length - 1 && (slide.kind !== 'stack' || ci >= cardCount - 1)

  const goSlide = (n: number) => {
    setSi(Math.max(0, Math.min(slides.length - 1, n)))
    setCi(0)
  }
  const next = () => {
    if (slide.kind === 'stack' && ci < cardCount - 1) setCi(ci + 1)
    else goSlide(si + 1)
  }
  const prev = () => {
    if (slide.kind === 'stack' && ci > 0) setCi(ci - 1)
    else goSlide(si - 1)
  }
  const home = () => goSlide(0)

  const jumpTo = (query: string) => {
    const q = query.toLowerCase()
    const idx = slides.findIndex(
      (s) =>
        s.kind === 'stack' &&
        (s.project.slug.toLowerCase() === q || s.project.slug.toLowerCase().includes(q)),
    )
    if (idx >= 0) goSlide(idx)
  }

  useEffect(() => {
    if (target) jumpTo(target.slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.nonce])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault()
      prev()
    } else if (e.key === 'Home') {
      e.preventDefault()
      home()
    }
  }

  const allProjects = [...data.work, ...data.side]

  return (
    <div className={styles.deck} role="group" aria-label="Projects deck" tabIndex={0} onKeyDown={onKeyDown}>
      <div className={styles.stage}>
        {slide.kind === 'contents' && (
          <div className={styles.contents}>
            <h2>Projects</h2>
            <p>A guided tour. Use Next / Prev, the arrow keys, or jump straight in:</p>
            <ul>
              {allProjects.map((p) => (
                <li key={p.slug}>
                  <button onClick={() => jumpTo(p.slug)}>
                    {p.title}
                    {p.placeholder ? ' (placeholder)' : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {slide.kind === 'divider' && <h2 className={styles.divider}>{slide.label}</h2>}

        {slide.kind === 'stack' && (
          <div className={styles.stack}>
            <h2>{slide.project.title}</h2>
            <p className={styles.summary}>{slide.project.summary}</p>
            {slide.project.placeholder && (
              <p className={styles.flag}>Placeholder — not yet written</p>
            )}
            {card && <Card card={card} />}
          </div>
        )}
      </div>

      <div className={styles.nav}>
        <button onClick={prev} disabled={atStart}>
          ◀ Prev
        </button>
        <button onClick={home}>Home</button>
        <button onClick={next} disabled={atEnd}>
          Next ▶
        </button>
        {slide.kind === 'stack' && (
          <span className={styles.count}>
            card {Math.min(ci, cardCount - 1) + 1} of {cardCount}
          </span>
        )}
      </div>
    </div>
  )
}
```

- [x] **Step 4: Implement `ProjectsDeck.module.css`**

```css
/* src/windows/ProjectsDeck.module.css */
.deck {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--font-read);
  font-size: var(--fs-read);
  line-height: 1.55;
  outline: none;
}
.stage {
  flex: 1;
  overflow: auto;
  padding: var(--space-4);
}
.stage :global(h3) {
  font-family: var(--font-chrome);
  font-size: var(--fs-h2);
  margin: 16px 0 4px;
  border-bottom: 1px solid var(--black);
}
.stage :global(img) {
  border: 1px solid var(--black);
  margin: 12px 0;
}
.summary {
  font-style: italic;
}
.flag {
  font-family: var(--font-chrome);
  font-size: var(--fs-ui);
  border: 1px solid var(--black);
  display: inline-block;
  padding: 1px 6px;
}
.divider {
  font-family: var(--font-chrome);
  font-size: 40px;
  text-align: center;
  margin-top: 22%;
}
.contents ul {
  list-style: none;
  padding: 0;
}
.contents button {
  font-family: var(--font-chrome);
  font-size: var(--fs-ui);
  border: 1px solid var(--black);
  padding: 4px 10px;
  margin: 3px 0;
  display: block;
  width: 100%;
  text-align: left;
}
.contents button:hover,
.contents button:focus-visible {
  background: var(--black);
  color: var(--white);
}
.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--black);
  padding: var(--space-2);
  font-family: var(--font-chrome);
  font-size: 12px;
}
.nav button {
  font-family: var(--font-chrome);
  border: 1px solid var(--black);
  padding: 2px 8px;
}
.nav button:disabled {
  color: var(--black);
  border-color: var(--black);
  text-decoration: line-through;
}
.count {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
```

- [x] **Step 5: Run the deck tests to verify they pass**

Run: `npm test -- ProjectsDeck`
Expected: PASS (all eight). If `card 1 of 5` fails, re-check `provider-directory.md` has exactly Overview + Problem + Approach + Result + Tech & Links = 5 cards; adjust the assertion to the real count rather than the content.

- [x] **Step 6: Full unit run + typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all green.

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: ProjectsDeck — contents / dividers / stacks with Prev-Next-Home nav"
```

---

### Task 4: Mount the deck; deep link; Terminal `projects` command

**Files:**
- Create: `src/windows/ProjectsWindow.tsx`
- Modify: `src/shell/Desktop.tsx`
- Modify: `src/terminal/types.ts`
- Modify: `src/terminal/commands.tsx`
- Modify: `src/terminal/useTerminal.tsx`
- Modify: `src/terminal/run.test.tsx` (one existing case)
- Modify: `tests/projects.spec.ts` (add the deck e2e cases)

**Interfaces:**
- Consumes: `ProjectsDeck` from `src/windows/ProjectsDeck.tsx`; `projects` / `findProject` from `src/content/projects.ts`; the Plan 2 `DesktopBridge`.
- Produces:
  - `src/windows/ProjectsWindow.tsx` default-exports `ProjectsWindow`, props `{ target: { slug: string; nonce: number } | null }` — renders `<ProjectsDeck data={projects} target={target} />`.
  - `DesktopBridge` gains `openStack(slug: string): void`. `CommandCtx` inherits it.
  - `Desktop` mounts a real `projects` window, reads `?open=projects&stack=<slug>` once on mount, and wires `bridge.openStack` to open the window + set a `{ slug, nonce }` target.
  - Terminal `projects` command: no arg → a clickable list of stack slugs; `projects <slug>` → `ctx.openStack(<matched slug>)`; unknown → an error node. `open projects` now succeeds (`projects` added to `OPENABLE`).

- [x] **Step 1: Write / adjust the failing tests**

`tests/projects.spec.ts` — append:

```ts
import type { Page } from '@playwright/test'

async function boot(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
}

test('the Projects icon opens the deck on the contents slide', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Projects' }).dblclick()
  const deck = page.getByRole('dialog', { name: /projects/i })
  await expect(deck).toBeVisible()
  await expect(deck.getByRole('heading', { level: 2, name: 'Projects' })).toBeVisible()
  await deck.getByRole('button', { name: 'Next ▶' }).click()
  await expect(deck.getByRole('heading', { level: 2, name: 'Work' })).toBeVisible()
})

test('Terminal `projects crisis` jumps the deck to that stack', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Terminal' }).dblclick()
  const input = page.getByRole('textbox', { name: /terminal input/i })
  await input.fill('projects crisis')
  await input.press('Enter')
  await expect(
    page.getByRole('dialog', { name: /projects/i }).getByRole('heading', {
      level: 2,
      name: 'Mental Health Crisis Detection',
    }),
  ).toBeVisible()
})

test('deep link ?open=projects&stack= lands on that stack', async ({ page }) => {
  await page.goto('/?open=projects&stack=referral-outbound-center')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
  await expect(
    page.getByRole('dialog', { name: /projects/i }).getByRole('heading', {
      level: 2,
      name: 'Referral Outbound Center',
    }),
  ).toBeVisible()
})

test('no serious axe violations with the deck open', async ({ page }) => {
  const AxeBuilder = (await import('@axe-core/playwright')).default
  await boot(page)
  await page.getByRole('button', { name: 'Projects' }).dblclick()
  await expect(page.getByRole('dialog', { name: /projects/i })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})
```

`src/terminal/run.test.tsx` — the existing case `open with an unknown target is an error, not a dispatch` currently uses `'open projects'`, which is about to become valid. Change it to a still-unknown target:

```tsx
test('open with an unknown target is an error, not a dispatch', () => {
  const open = vi.fn()
  const out = txt(runCommand('open trash', makeCtx({ open })))
  expect(open).not.toHaveBeenCalled()
  expect(out).toMatch(/no such window/i)
})
```

Add a `projects` command case:

```tsx
test('projects <slug> opens that stack through the bridge', () => {
  const openStack = vi.fn()
  runCommand('projects crisis', makeCtx({ openStack }))
  expect(openStack).toHaveBeenCalledWith('crisis-detection')
})

test('projects with an unknown stack is an error', () => {
  expect(txt(runCommand('projects nope', makeCtx()))).toMatch(/no such stack/i)
})
```

(`makeCtx` in that file must gain `openStack: () => {}` in its defaults — add it.)

- [x] **Step 2: Run to verify they fail**

Run: `npm test -- src/terminal/run` then `npm run test:e2e -- projects`
Expected: unit — the new `projects` cases fail (`openStack` undefined / no command); e2e — deck cases fail (no `projects` window renders).

- [x] **Step 3: `DesktopBridge` gains `openStack`**

`src/terminal/types.ts`:

```ts
export interface DesktopBridge {
  open(id: WindowId): void
  close(id: WindowId): void
  beep(): void
  openStack(slug: string): void
}
```

- [x] **Step 4: `useTerminal` passes `openStack` through `ctx`**

In `src/terminal/useTerminal.tsx`, add to the `ctx` `useMemo`:

```ts
      open: (id) => bridgeRef.current.open(id),
      close: (id) => bridgeRef.current.close(id),
      beep: () => bridgeRef.current.beep(),
      openStack: (slug) => bridgeRef.current.openStack(slug),
```

- [x] **Step 5: Add the `projects` command and make `open projects` valid**

`src/terminal/commands.tsx` — add the import:

```ts
import { projects, findProject } from '../content/projects'
```

Add `'projects'` to `OPENABLE`:

```ts
const OPENABLE: WindowId[] = ['resume', 'readme', 'terminal', 'projects']
```

Insert a `projects` command (before `date`, after `open`):

```tsx
  {
    name: 'projects',
    description: 'browse the project stacks',
    usage: 'projects [stack]',
    run: (args, ctx) => {
      if (args[0]) {
        const p = findProject(projects, args[0])
        if (!p) return <span className="term-err">projects: no such stack: {args[0]}</span>
        ctx.openStack(p.slug)
        return null
      }
      const flat = [...projects.work, ...projects.side]
      return (
        <div className="term-ls">
          {flat.map((p) => (
            <button key={p.slug} className="term-file" onClick={() => ctx.run(`projects ${p.slug}`)}>
              {p.slug}
            </button>
          ))}
        </div>
      )
    },
  },
```

- [x] **Step 6: Implement `ProjectsWindow.tsx`**

```tsx
// src/windows/ProjectsWindow.tsx
import { projects } from '../content/projects'
import ProjectsDeck from './ProjectsDeck'

export default function ProjectsWindow({
  target,
}: {
  target: { slug: string; nonce: number } | null
}) {
  return <ProjectsDeck data={projects} target={target} />
}
```

- [x] **Step 7: Wire `Desktop.tsx`**

Add imports:

```tsx
import { useReducer, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react'
import ProjectsWindow from '../windows/ProjectsWindow'
```

Inside `Desktop()`, after `close` is defined, add the stack-target state and the deep-link effect:

```tsx
  const [stackTarget, setStackTarget] = useState<{ slug: string; nonce: number } | null>(null)
  const targetNonce = useRef(0)

  const jumpToStack = useCallback((slug: string) => {
    dispatch({ type: 'open', id: 'projects' })
    setStackTarget({ slug, nonce: ++targetNonce.current })
  }, [])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('open') !== 'projects') return
    dispatch({ type: 'open', id: 'projects' })
    const s = p.get('stack')
    if (s) setStackTarget({ slug: s, nonce: ++targetNonce.current })
  }, [])
```

Extend the `bridge` memo:

```tsx
  const bridge = useMemo<DesktopBridge>(
    () => ({
      open: (id) => dispatch({ type: 'open', id }),
      close: (id) => close(id),
      beep: () => sound.beep(),
      openStack: (slug) => jumpToStack(slug),
    }),
    [close, sound, jumpToStack],
  )
```

Add `projects` to the `content` map:

```tsx
  const content: Partial<Record<WindowId, ReactNode>> = {
    resume: <ResumeWindow />,
    readme: <ReadMeWindow />,
    terminal: <TerminalWindow bridge={bridge} />,
    projects: <ProjectsWindow target={stackTarget} />,
  }
```

- [x] **Step 8: Run unit tests + typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all green (49 + Task 1–3 additions + the new `projects` command cases). If TS complains that other `DesktopBridge` literals are missing `openStack`, the only other construction site is `Desktop.tsx`'s `bridge` memo (just edited) and the test mocks — fix each mock to include `openStack: vi.fn()` / `() => {}`.

- [x] **Step 9: Run the e2e suite**

Run: `npm run test:e2e`
Expected: all green — `tests/projects.spec.ts` (no-JS + deck + deep link + axe), `tests/mobile.spec.ts`, `tests/terminal.spec.ts`, `tests/a11y.spec.ts` all pass. If the deep-link test is flaky because the boot overlay is still up when the effect runs, note that the effect runs on mount regardless of boot; the assertion just needs the `waitFor` on the boot text.

- [x] **Step 10: Build + prerender assert**

Run: `npm run build && npm run prerender:assert`
Expected: green; `Provider Directory` needle passes.

- [x] **Step 11: Manual smoke**

Run: `npm run dev`, skip boot. Double-click **Projects**: contents slide, Next → "Work" divider → Provider Directory card 1 of 5, arrow keys page through, the SVG shows on the Approach card, "card N of M" tracks, Home returns, Prev is struck-through on the contents slide. Open **Terminal**, run `projects` (clickable slug list) then `projects crisis` (deck jumps to Mental Health Crisis Detection). Load `/?open=projects&stack=referral-outbound-center` in a fresh tab → deck opens on that stack.

- [x] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: mount the Projects deck; ?open=projects&stack= deep link; Terminal projects command"
```

---

## Self-Review

**1. Spec coverage** (the "Projects — HyperCard stacks + Keynote-style dividers" section)

| Spec point | Task |
| --- | --- |
| One guided deck, also enterable per project | 3 (contents slide + `jumpTo`), 4 (`openStack`, deep link) |
| Order: title slide "Work" → work stacks → divider "Outside of Work Projects" → side stacks | 3 (`buildSlides`) |
| Work stacks: Provider Directory, Referral Outbound Center; public-safe detail only | 1 (authored from résumé bullets only) |
| Side stacks: Mental Health Crisis Detection (real); AI Fitness / Calorie bot (placeholder, flagged) | 1 (`crisis-detection.md` real with a fill-in Result; `fitness-bot.md` `placeholder: true`) |
| Card model: Title → Problem → Approach → Result → Tech/Links | 1 (`Overview` + `##` sections + synthesized `Tech & Links` card) |
| Black-and-white 1-bit card art | 1 (`provider-directory-flow.svg`) — one diagram; more are a content-authoring task, not code |
| Nav: on-card Prev/Next/Home, keyboard arrows, "card N of M", jump from Terminal (`projects crisis`) or a contents card | 3 (buttons + `onKeyDown` + count + contents buttons), 4 (`projects` command) |
| Content from `content/projects/<slug>.md`, front matter for group + order | 1 |
| Deep links `?open=projects&stack=crisis` | 4 |
| Real static HTML / no-JS / mobile: Projects reads in the stacked document | 2 (`ProjectsArticle` in `#main`, `assert-prerendered.mjs` needle, `fallback.css`, `mobile.spec.ts`) |
| Reuse: "messy data → clean structure" as a 1-bit card diagram in Provider Directory | 1 (the SVG is exactly this) |

**Deferred (recorded here, mirroring how Plans 1–2 deferred outline-drag / interactive menus / a mobile terminal):**

- **Dithered transitions** (dissolve / wipe / iris / barn door) and the Keynote "slow push" on divider slides. The deck is fully usable with instant swaps; a WAAPI mask animation is the highest-risk / lowest-value item in this slice, and `ZoomRectLayer` is a working precedent to copy from. **A small follow-up plan**, alongside 3-B (menu bar), 3-C (desk accessories), 3-D (polish).
- **More card diagrams** (the Toronto → Austin → New York city journey; a Referral Outbound Center flow). Pure content authoring — drop an `<svg>` or `![]()` into the relevant `.md`; no code change.
- **General `?open=<window>` deep links** for résumé / readme / terminal. This plan wires only `?open=projects` because that is what the deck needs; a generic handler is a shell concern for a later plan.
- **`hypercard` alias** for `projects` in the Terminal (spec lists it as hidden). Trivial to add with the transitions plan; omitted here to keep the command list honest and minimal.

**2. Placeholder scan**

- `crisis-detection.md` and `fitness-bot.md` contain `___ (Samuel to fill in: …)` — the deliberate, spec-sanctioned convention from `content/about.md`, not a plan placeholder. `fitness-bot.md` additionally carries `placeholder: true` so the render layer badges it.
- Every code step has complete code. The SVG, all four content files, both components, and every test are given in full.
- No "TODO" / "TBD" / "similar to Task N".

**3. Type consistency**

- `Project` / `ProjectCard` / `ProjectLink` / `ProjectsData` defined once in `projectTypes.ts`; consumed unchanged by `projects.ts` (Task 1), `projectsContent.tsx` (Task 2), `ProjectsDeck.tsx` (Task 3), `ProjectsWindow.tsx` (Task 4).
- `ProjectCard` is a discriminated union on `kind: 'prose' | 'techlinks'`; both render sites (`ProjectsArticle`, `ProjectsDeck`'s `Card`) switch on it identically.
- `findProject(data, query)` — same signature in `projects.ts`, its test, and the `projects` command; the deck's internal `jumpTo` uses the same "exact then includes" rule inline (kept local to avoid importing `findProject` into a component).
- `target: { slug: string; nonce: number } | null` — identical prop shape across `ProjectsDeck`, `ProjectsWindow`, and `Desktop`'s `stackTarget` state.
- `DesktopBridge` gains exactly one method (`openStack(slug: string): void`); the two construction sites (`Desktop.tsx` bridge memo, test mocks) and the one consumer (`useTerminal` `ctx`) are all updated in Task 4.
- Heading levels: `<h2>` project title, `<h3>` card heading — same in `ProjectsArticle` and `ProjectsDeck`; asserted by `projectsContent.test.tsx` ("renders no h1") and the deck tests (all `level: 2` / `level: 3` queries).

---

## Done criteria for Plan 3-A

- `npm test` and `npm run test:e2e` green, including `src/content/projects.test.ts`, `src/windows/projectsContent.test.tsx`, `src/windows/ProjectsDeck.test.tsx`, and the new `tests/projects.spec.ts` cases.
- `npm run build && npm run prerender:assert` green — `dist/index.html` contains the project content as real HTML; the `Provider Directory` needle passes.
- `npx tsc --noEmit` clean.
- JS on, ≥768px: the Projects icon opens the deck; contents → dividers → stacks navigate with buttons and arrow keys; "card N of M" tracks; the Provider Directory diagram renders; `projects` / `projects <slug>` work in the Terminal; `open projects` works; `?open=projects&stack=<slug>` opens the deck on that stack.
- `<768px` and no-JS: résumé, Read Me, then **Projects** read top to bottom in `#main`; no `projects` dialog.
- No new npm dependencies.
- `content/projects/crisis-detection.md` and `content/projects/fitness-bot.md` still contain their `___` fill-in markers (Samuel's to complete) — and no prerender needle points at either file.
