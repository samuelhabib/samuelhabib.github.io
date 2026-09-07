import { test, expect } from '@playwright/test'

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('mobile shows the stacked document, not the desktop', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /samuel habib/i })).toBeVisible()
    await expect(page.getByRole('dialog', { name: /résumé/i })).toHaveCount(0)
  })
})

test('desktop shows the windowed shell', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
})
