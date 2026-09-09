import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/')
  // Boot overlay (z-index 5000) covers the desktop; wait it out so pointer
  // events reach the icons.
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
}

async function dragIcon(page: Page, dx: number, dy: number) {
  const resume = page.locator('[data-window="resume"]')
  const box = (await resume.boundingBox())!
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + dx, cy + dy, { steps: 12 })
  await page.mouse.up()
  return box
}

test('icons drag freely and Special ▸ Clean Up re-grids without a reload', async ({ page }) => {
  await ready(page)
  const resume = page.locator('[data-window="resume"]')
  const start = await dragIcon(page, -220, 40)
  const moved = (await resume.boundingBox())!
  expect(Math.abs(moved.x - start.x)).toBeGreaterThan(150)

  await page.getByRole('button', { name: 'Special' }).click()
  await page.getByRole('menuitem', { name: 'Clean Up' }).click()
  const cleaned = (await resume.boundingBox())!
  expect(Math.abs(cleaned.x - start.x)).toBeLessThan(4)
  expect(Math.abs(cleaned.y - start.y)).toBeLessThan(4)
})

test('a moved icon survives a reload but a fresh tab starts on the default grid', async ({
  page,
  browser,
}) => {
  await ready(page)
  const start = await dragIcon(page, -220, 40)
  const movedX = (await page.locator('[data-window="resume"]').boundingBox())!.x
  expect(Math.abs(movedX - start.x)).toBeGreaterThan(150)

  await page.reload()
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
  const afterReload = (await page.locator('[data-window="resume"]').boundingBox())!
  expect(Math.abs(afterReload.x - movedX)).toBeLessThan(4)

  const fresh = await browser.newContext()
  const freshPage = await fresh.newPage()
  await ready(freshPage)
  const freshBox = (await freshPage.locator('[data-window="resume"]').boundingBox())!
  expect(Math.abs(freshBox.x - start.x)).toBeLessThan(4)
  await fresh.close()
})

test('a plain double-click still opens the window', async ({ page }) => {
  await ready(page)
  await page.locator('[data-window="resume"]').dblclick()
  await expect(page.getByRole('dialog', { name: 'Résumé' })).toBeVisible()
})

test('the "Samuel Habib" hard-disk icon opens About This Portfolio', async ({ page }) => {
  await ready(page)
  const disk = page.locator('[data-window="about"]')
  await expect(disk).toContainText('Samuel Habib')
  await disk.dblclick()
  await expect(page.getByRole('dialog', { name: /about this portfolio/i })).toBeVisible()
})
