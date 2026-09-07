import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('no serious axe violations on load', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Space') // skip boot
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('Escape closes the front window', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Space')
  await expect(page.getByRole('dialog', { name: /read me/i })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: /read me/i })).toHaveCount(0)
})

test('has a skip link and Person JSON-LD', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a.skip')).toHaveAttribute('href', '#main')
  const ld = await page.locator('script[type="application/ld+json"]').textContent()
  expect(ld).toContain('"@type": "Person"')
  expect(ld).toContain('Samuel Habib')
})
