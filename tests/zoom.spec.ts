import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
}

test('the zoom box fills the desktop and restores the exact rect', async ({ page }) => {
  await ready(page)
  const win = page.getByRole('dialog', { name: 'Résumé' })
  const before = (await win.boundingBox())!
  await page.getByRole('button', { name: 'Zoom Résumé' }).click()
  const zoomed = (await win.boundingBox())!
  expect(zoomed.width).toBeGreaterThan(before.width + 20)
  await page.getByRole('button', { name: 'Zoom Résumé' }).click()
  const restored = (await win.boundingBox())!
  expect(Math.round(restored.width)).toBe(Math.round(before.width))
  expect(Math.round(restored.x)).toBe(Math.round(before.x))
})

test('opening a window from the File menu plays the zoom-rect, leaving nothing stranded', async ({
  page,
}) => {
  await ready(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Terminal' }).click()
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
  await expect(page.locator('div[aria-hidden][style*="9999"]')).toHaveCount(0)
})

test('Cmd-backtick moves the front-window check in the Windows menu', async ({ page }) => {
  await ready(page)
  // Read Me is front on load (opened second). Cmd-` cycles forward to Résumé.
  await page.keyboard.press('Meta+`')
  await page.getByRole('button', { name: 'Windows' }).click()
  await expect(page.getByRole('menuitemcheckbox', { name: 'Résumé' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(page.getByRole('menuitemcheckbox', { name: 'Read Me' })).toHaveAttribute(
    'aria-checked',
    'false',
  )
})

test('View ▸ Enter/Exit Full Screen toggles document.fullscreenElement', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'View' }).click()
  await page.getByRole('menuitem', { name: 'Enter Full Screen' }).click()
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(true)
  await page.getByRole('button', { name: 'View' }).click()
  await page.getByRole('menuitem', { name: 'Exit Full Screen' }).click()
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(false)
})
