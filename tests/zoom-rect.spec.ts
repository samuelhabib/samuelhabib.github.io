import { test, expect } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

// Passes once Task 9 mounts the desktop.
test('window opens without a lingering zoom-rect under reduced motion', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
  await expect(page.locator('div[aria-hidden][style*="9999"]')).toHaveCount(0)
})
