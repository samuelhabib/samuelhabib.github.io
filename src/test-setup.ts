import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia. Components probe two things through it:
//  - min-width (desktop gate) → true, jsdom's viewport is desktop-sized
//  - prefers-reduced-motion   → false, so motion paths run as in a real browser
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
