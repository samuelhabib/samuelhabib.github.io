import type { WindowId } from '../shell/windows'

export interface InfoCard {
  subject: string
  kind: string
  created: string
  modified: string
  size: string
  where: string
  comment: string
}

const built = __BUILD_DATE__

export const INFO: Record<WindowId, InfoCard> = {
  resume: {
    subject: 'Résumé',
    kind: 'Portfolio document',
    created: 'March 2003',
    modified: built,
    size: '48K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Backend / data engineer. Healthcare data that other people depend on being right.',
  },
  projects: {
    subject: 'Projects',
    kind: 'Slide deck',
    created: 'March 2003',
    modified: built,
    size: '2.1 MB on disk',
    where: 'samuelhabib.github.io',
    comment: 'Case studies, presented. Use the arrow keys.',
  },
  terminal: {
    subject: 'Terminal',
    kind: 'Terminal emulator',
    created: 'March 2003',
    modified: built,
    size: '32K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Type `help`. `sudo` will not help you here.',
  },
  readme: {
    subject: 'Read Me',
    kind: 'SimpleText document',
    created: 'March 2003',
    modified: built,
    size: '12K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Start here if the desktop metaphor is not doing it for you.',
  },
  puzzle: {
    subject: 'Puzzle',
    kind: 'Desk accessory',
    created: 'March 2003',
    modified: built,
    size: '16K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Fifteen tiles. One gap. Classic time sink.',
  },
  about: {
    subject: 'About This Portfolio',
    kind: 'Desk accessory',
    created: 'March 2003',
    modified: built,
    size: '8K on disk',
    where: 'samuelhabib.github.io',
    comment: 'System 7, remastered.',
  },
  appearance: {
    subject: 'Appearance',
    kind: 'Control panel',
    created: 'March 2003',
    modified: built,
    size: '20K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Five themes, four desktop patterns, zero colors (almost).',
  },
  getinfo: {
    subject: 'Info',
    kind: 'Window',
    created: 'March 2003',
    modified: built,
    size: '4K on disk',
    where: 'samuelhabib.github.io',
    comment: 'This one is a bit recursive. Sorry.',
  },
  skills: {
    subject: 'Skills',
    kind: 'Chooser',
    created: 'March 2003',
    modified: built,
    size: '12K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Pick a category on the left. No ratings, no bars — just the tools.',
  },
  calculator: {
    subject: 'Calculator',
    kind: 'Desk accessory',
    created: 'March 2003',
    modified: built,
    size: '10K on disk',
    where: 'samuelhabib.github.io',
    comment: 'Four functions. The keyboard works too.',
  },
  scrapbook: {
    subject: 'Scrapbook',
    kind: 'Desk accessory',
    created: 'March 2003',
    modified: built,
    size: '28K on disk',
    where: 'samuelhabib.github.io',
    comment: 'The project diagrams, kept as clippings. Arrow keys page through.',
  },
  writeup: {
    subject: 'Project Notes',
    kind: 'SimpleText document',
    created: 'March 2003',
    modified: built,
    size: '24K on disk',
    where: 'samuelhabib.github.io',
    comment: 'The long version — what the slides skip.',
  },
}
