import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
}

test('chrome renders in Chicago once fonts are ready (no fallback flash)', async ({ page }) => {
  await ready(page)
  await page.evaluate(() => (document as unknown as { fonts: FontFaceSet }).fonts.ready)
  const trigger = page.locator('[data-testid="menubar"] button', { hasText: 'File' })
  const fam = await trigger.evaluate((el) => getComputedStyle(el).fontFamily)
  expect(fam.split(',')[0].replace(/["']/g, '')).toBe('Chicago')
  expect(
    await page.evaluate(() =>
      (document as unknown as { fonts: FontFaceSet }).fonts.check('16px Chicago'),
    ),
  ).toBe(true)
})

test('the three core faces are preloaded', async ({ page }) => {
  await page.goto('/')
  for (const f of ['chicago', 'newyork', 'monaco']) {
    await expect(page.locator(`link[rel="preload"][href*="${f}.woff2"]`)).toHaveCount(1)
  }
})
