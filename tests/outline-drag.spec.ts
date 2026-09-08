import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function boot(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
}

test('outline dragging: the window commits to the drop position on release', async ({ page }) => {
  await boot(page)
  const dialog = page.getByRole('dialog', { name: /read me/i })
  const bar = dialog.getByTestId('titlebar')
  const before = await dialog.boundingBox()
  const grip = await bar.boundingBox()
  await page.mouse.move(grip!.x + 40, grip!.y + grip!.height / 2)
  await page.mouse.down()
  await page.mouse.move(grip!.x + 200, grip!.y + 140, { steps: 20 })
  const mid = await dialog.boundingBox()
  expect(Math.abs(mid!.x - before!.x)).toBeLessThan(6)
  await page.mouse.up()
  const after = await dialog.boundingBox()
  expect(after!.x - before!.x).toBeGreaterThan(120)
  expect(after!.y - before!.y).toBeGreaterThan(100)
})

test('View ▸ Outline dragging switches to live drag', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'View' }).click()
  await page.getByRole('menuitemcheckbox', { name: /outline dragging/i }).click()
  const dialog = page.getByRole('dialog', { name: /read me/i })
  const bar = dialog.getByTestId('titlebar')
  const before = await dialog.boundingBox()
  const grip = await bar.boundingBox()
  await page.mouse.move(grip!.x + 40, grip!.y + grip!.height / 2)
  await page.mouse.down()
  await page.mouse.move(grip!.x + 160, grip!.y + 90, { steps: 20 })
  const mid = await dialog.boundingBox()
  expect(mid!.x - before!.x).toBeGreaterThan(80)
  await page.mouse.up()
})
