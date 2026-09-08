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
        {
          icon: 'split',
          text: 'Outbound referrals from sender facilities were manual and hard to track.',
        },
        {
          icon: 'eye',
          text: 'No single place to send, monitor and follow up — referrals could quietly drop.',
        },
      ],
    },
    {
      layout: 'diagram',
      name: 'ReferralPipeline',
      title: 'The approach',
      caption: 'Owned end to end — the flow, the service, and the tracking that keeps a referral’s state legible.',
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
