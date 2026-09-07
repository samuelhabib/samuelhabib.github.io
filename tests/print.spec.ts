import { test, expect } from '@playwright/test'

test('print view shows only the résumé document', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Space')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#main')).toBeVisible()
  await expect(page.locator('.desktop')).toBeHidden()
})

test('Save as PDF button exists in the résumé window', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: /save as pdf/i })).toBeVisible()
})
