import type { ProjectDeck } from '../slideTypes'

// NOTE: the Result is still `___` in content/projects/crisis-detection.md.
// When Samuel fills it, replace the 'Where it stands' points slide below
// with a { layout: 'stat', value: <headline metric>, label: <dataset>, foot: <one change> }.
const crisisDetection: ProjectDeck = {
  slug: 'crisis-detection',
  title: 'Mental Health Crisis Detection',
  slides: [
    {
      layout: 'title',
      kicker: 'Side project · self-directed',
      title: 'Mental Health Crisis Detection',
      subtitle: 'A problem where the false negative is the expensive one.',
    },
    {
      layout: 'points',
      title: 'The problem',
      items: [
        {
          icon: 'eye',
          text: 'Crisis signals in free text are easy for a person to skim past and hard to triage at volume.',
        },
        {
          icon: 'flag',
          text: 'Missing one matters more than a handful of false alarms.',
        },
      ],
    },
    {
      layout: 'diagram',
      name: 'RecallVsCost',
      title: 'The approach',
      caption:
        'A text classifier on a RoBERTa encoder, tuned for recall on the crisis class and evaluated on public datasets.',
    },
    {
      layout: 'points',
      title: 'Where it stands',
      items: [
        {
          icon: 'refresh',
          text: 'Benchmarking on public datasets now; the headline numbers land in the write-up.',
        },
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
