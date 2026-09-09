import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/')
  // Boot overlay sits above everything at z-index 5000; wait it out so pointer
  // events reach the window chrome instead of the overlay.
  await page.getByText('Welcome to Macintosh').waitFor({ state: 'detached', timeout: 6000 }).catch(() => {})
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
}

test('résumé window drags with the pointer across many move events', async ({ page }) => {
  await ready(page)
  const dialog = page.getByRole('dialog', { name: /résumé/i })
  const before = await dialog.boundingBox()

  const bar = dialog.getByTestId('titlebar')
  const grip = await bar.boundingBox()
  await page.mouse.move(grip!.x + 40, grip!.y + grip!.height / 2)
  await page.mouse.down()
  await page.mouse.move(grip!.x + 160, grip!.y + grip!.height / 2 + 90, { steps: 20 })
  await page.mouse.up()

  const after = await dialog.boundingBox()
  expect(after!.x - before!.x).toBeGreaterThan(90)
  expect(after!.y - before!.y).toBeGreaterThan(60)
})

test('a window cannot be dragged off the desktop', async ({ page }) => {
  await ready(page)
  const dialog = page.getByRole('dialog', { name: /résumé/i })
  const bar = dialog.getByTestId('titlebar')
  const grip = await bar.boundingBox()
  await page.mouse.move(grip!.x + 40, grip!.y + grip!.height / 2)
  await page.mouse.down()
  // yank hard toward the top-left, past the origin
  await page.mouse.move(-800, -800, { steps: 20 })
  await page.mouse.up()

  const after = await dialog.boundingBox()
  const vp = page.viewportSize()!
  // title bar still on screen and a usable strip of the window still visible
  expect(after!.y).toBeGreaterThanOrEqual(0)
  expect(after!.x + after!.width).toBeGreaterThan(40)
  expect(after!.y).toBeLessThan(vp.height)
})

test('résumé window resizes from the grow box', async ({ page }) => {
  await ready(page)
  const dialog = page.getByRole('dialog', { name: /résumé/i })
  const before = await dialog.boundingBox()

  const grow = dialog.getByRole('button', { name: /resize résumé/i })
  const box = await grow.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x + 140, box!.y + 110, { steps: 20 })
  await page.mouse.up()

  const after = await dialog.boundingBox()
  expect(after!.width - before!.width).toBeGreaterThan(100)
  expect(after!.height - before!.height).toBeGreaterThan(80)
})
