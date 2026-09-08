import type { ProjectDeck } from '../slideTypes'
import providerDirectory from './provider-directory'
import referralOutboundCenter from './referral-outbound-center'
import crisisDetection from './crisis-detection'

/** Presentation decks by project slug. A project without an entry here
 *  falls back to rendering its markdown cards. */
export const DECKS: Record<string, ProjectDeck> = {
  [providerDirectory.slug]: providerDirectory,
  [referralOutboundCenter.slug]: referralOutboundCenter,
  [crisisDetection.slug]: crisisDetection,
}
