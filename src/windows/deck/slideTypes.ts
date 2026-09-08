/**
 * The presentation layer. A project's deep write-up stays in
 * `content/projects/<slug>.md` (canonical, ATS-readable). This is the *skim*:
 * a hand-authored sequence of terse, visual slides, one idea each.
 */

export type DiagramName = 'ReconcileLoop'

export type DeckIconName =
  | 'split'
  | 'clock'
  | 'eye'
  | 'refresh'
  | 'flag'
  | 'check'
  | 'link'

export type Slide =
  | { layout: 'title'; kicker?: string; title: string; subtitle?: string }
  | { layout: 'points'; title: string; items: { icon: DeckIconName; text: string }[] }
  | { layout: 'diagram'; name: DiagramName; title?: string; caption?: string }
  | { layout: 'stat'; value: string; label: string; foot?: string }
  | { layout: 'quote'; text: string; attribution?: string }
  | { layout: 'tech'; title?: string; items: string[] }

export interface ProjectDeck {
  slug: string
  /** shown as the deck's section title + the title slide */
  title: string
  slides: Slide[]
}
