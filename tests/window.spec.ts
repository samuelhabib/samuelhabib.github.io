import { test, expect } from '@playwright/test'

// Passes once Task 9 mounts the Résumé window on the desktop.
test('résumé window can be dragged', async ({ page }) => {
  await page.goto('/')
  const dialog = page.getByRole('dialog', { name: /résumé/i })
  await expect(dialog).toBeVisible()
  const before = await dialog.boundingBox()
  await page.getByTestId('titlebar').first().hover()
  await page.mouse.down()
  await page.mouse.move(600, 400)
  await page.mouse.up()
  const after = await dialog.boundingBox()
  expect(after!.x).not.toBe(before!.x)
})
