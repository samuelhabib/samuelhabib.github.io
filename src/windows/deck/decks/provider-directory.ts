import type { ProjectDeck } from '../slideTypes'

/**
 * Skim view. Full write-up: content/projects/provider-directory.md
 * (also the no-JS <article> fallback).
 */
const providerDirectory: ProjectDeck = {
  slug: 'provider-directory',
  title: 'Provider Directory',
  slides: [
    {
      layout: 'title',
      kicker: 'ExaCare · self-scoped',
      title: 'Provider Directory',
      subtitle: 'Six disagreeing rosters into one directory that repairs itself every week.',
    },
    {
      layout: 'points',
      title: 'The problem',
      items: [
        { icon: 'split', text: 'Six public sources — CMS, the NPI registry, plan rosters — that disagree with each other.' },
        { icon: 'clock', text: 'They go stale and move. 40,000+ rows, no single source of truth.' },
        { icon: 'eye', text: 'Features asked “which providers are real?” and got whatever snapshot was loaded.' },
      ],
    },
    {
      layout: 'diagram',
      name: 'ReconcileLoop',
      title: 'The approach',
      caption:
        'Normalize every roster to one shape; a weekly job diffs the live sources and repairs the drift itself.',
    },
    {
      layout: 'stat',
      value: '40,000+',
      label: 'rows across six rosters, kept current without a human in the loop',
      foot: 'Reconciliation runs weekly, unattended.',
    },
    {
      layout: 'tech',
      title: 'Built with',
      items: ['Python', 'PostgreSQL', 'Public CMS / NPI data', 'Scheduled reconciliation'],
    },
  ],
}

export default providerDirectory
