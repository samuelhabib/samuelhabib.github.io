import { describe, it, expect } from 'vitest'
import { DECKS } from './index'
import { DIAGRAMS } from '../diagrams'

const ICON_NAMES = ['split', 'clock', 'eye', 'refresh', 'flag', 'check', 'link']
const LAYOUTS = ['title', 'points', 'diagram', 'stat', 'quote', 'tech']

describe('presentation decks', () => {
  it('every deck keys itself by its own slug and has slides', () => {
    for (const [key, deck] of Object.entries(DECKS)) {
      expect(deck.slug).toBe(key)
      expect(deck.slides.length).toBeGreaterThan(0)
    }
  })

  it('every diagram slide names a registered diagram; every point names a real icon', () => {
    for (const deck of Object.values(DECKS)) {
      for (const slide of deck.slides) {
        if (slide.layout === 'diagram') {
          expect(Object.keys(DIAGRAMS)).toContain(slide.name)
        }
        if (slide.layout === 'points') {
          for (const it of slide.items) expect(ICON_NAMES).toContain(it.icon)
        }
      }
    }
  })

  it('the first slide of every deck is its title', () => {
    for (const deck of Object.values(DECKS)) {
      expect(deck.slides[0].layout).toBe('title')
      if (deck.slides[0].layout === 'title') expect(deck.slides[0].title).toBe(deck.title)
    }
  })

  it('every slide uses a known layout', () => {
    for (const deck of Object.values(DECKS)) {
      for (const slide of deck.slides) expect(LAYOUTS).toContain(slide.layout)
    }
  })
})
