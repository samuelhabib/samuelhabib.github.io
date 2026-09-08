import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import SlideView from './SlideView'
import type { Slide } from './slideTypes'

afterEach(() => vi.unstubAllGlobals())

describe('SlideView', () => {
  it('title slide renders the project title as an h2', () => {
    render(
      <SlideView
        play={false}
        slide={{ layout: 'title', kicker: 'ExaCare', title: 'Provider Directory', subtitle: 'x' }}
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
    expect(screen.getByText('ExaCare')).toBeVisible()
  })

  it('points slide renders one row per item with its glyph', () => {
    const slide: Slide = {
      layout: 'points',
      title: 'The problem',
      items: [
        { icon: 'split', text: 'sources disagree' },
        { icon: 'clock', text: 'they go stale' },
      ],
    }
    render(<SlideView play={false} slide={slide} />)
    expect(screen.getByRole('heading', { level: 2, name: 'The problem' })).toBeVisible()
    expect(screen.getByText('sources disagree')).toBeVisible()
    expect(screen.getAllByRole('img', { hidden: true }).length).toBeGreaterThanOrEqual(2)
  })

  it('diagram slide mounts the named diagram with an accessible name', () => {
    render(<SlideView play={false} slide={{ layout: 'diagram', name: 'ReconcileLoop', caption: 'c' }} />)
    expect(screen.getByRole('img', { name: /reconcile/i })).toBeInTheDocument()
    expect(screen.getByText('c')).toBeVisible()
    // self-heal caption lives in the SVG and DIRECTORY is labelled exactly once
    const svg = screen.getByRole('img', { name: /reconcile/i })
    const texts = [...svg.querySelectorAll('text')].map((t) => t.textContent)
    expect(texts.some((t) => /self-heal/i.test(t ?? ''))).toBe(true)
    expect(texts.filter((t) => /DIRECTORY/i.test(t ?? '')).length).toBe(1)
  })

  it('stat slide shows value, label and foot', () => {
    render(
      <SlideView
        play={false}
        slide={{ layout: 'stat', value: '40,000+', label: 'rows kept current', foot: 'weekly' }}
      />,
    )
    expect(screen.getByText('40,000+')).toBeVisible()
    expect(screen.getByText('rows kept current')).toBeVisible()
    expect(screen.getByText('weekly')).toBeVisible()
  })

  it('tech slide lists each chip', () => {
    render(<SlideView play={false} slide={{ layout: 'tech', title: 'Built with', items: ['Python', 'PostgreSQL'] }} />)
    expect(screen.getByText('Python')).toBeVisible()
    expect(screen.getByText('PostgreSQL')).toBeVisible()
  })

  it('with reduced motion, play=true renders identically to play=false', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }))
    const slide: Slide = { layout: 'stat', value: '1', label: 'x' }
    const off = render(<SlideView play={false} slide={slide} />).container.innerHTML
    const on = render(<SlideView play={true} slide={slide} />).container.innerHTML
    expect(on).toBe(off)
  })
})
