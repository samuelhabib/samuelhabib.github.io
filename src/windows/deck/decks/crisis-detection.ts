import type { ProjectDeck } from '../slideTypes'

// NOTE: the Result is still `___` in content/projects/crisis-detection.md.
// When Samuel fills it, replace the 'Results' points slide below with a
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
      title: 'Results',
      items: [
        {
          icon: 'refresh',
          text: 'Evaluation on public datasets is in progress — headline numbers go in the full write-up once they are ones I would stand behind.',
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
