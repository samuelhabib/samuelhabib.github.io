import { test, expect } from '@playwright/test'

test('boot shows once then not again in the same session', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Welcome to Macintosh')).toBeVisible()
  await expect(page.getByText('Welcome to Macintosh')).toBeHidden({ timeout: 3000 })
  await page.reload()
  await expect(page.getByText('Welcome to Macintosh')).toHaveCount(0)
})

test('any key skips the boot', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Space')
  await expect(page.getByText('Welcome to Macintosh')).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
})
