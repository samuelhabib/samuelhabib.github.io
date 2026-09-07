import { test, expect } from '@playwright/test'

test('exposes 1-bit tokens and a hard-edged dither utility', async ({ page }) => {
  await page.goto('/')
  const styles = await page.evaluate(() => {
    const r = getComputedStyle(document.documentElement)
    const probe = document.createElement('div')
    probe.className = 'dither-50'
    document.body.appendChild(probe)
    const bg = getComputedStyle(probe).backgroundImage
    probe.remove()
    return { black: r.getPropertyValue('--black').trim(), white: r.getPropertyValue('--white').trim(), bg }
  })
  expect(styles.black).toBe('#000')
  expect(styles.white).toBe('#fff')
  // dither is a background image, never a grey fill
  expect(styles.bg).not.toBe('none')
  // and it is built from hard colour stops, not a soft (antialiased -> grey) gradient
  expect(styles.bg).toMatch(/conic-gradient|repeating-linear-gradient/)
})
