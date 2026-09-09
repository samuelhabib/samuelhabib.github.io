import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function boot(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
}

test('Apple ▸ Home returns to the landing arrangement', async ({ page }) => {
  await boot(page)
  // make a mess: close Read Me, then open Puzzle
  await page
    .getByRole('dialog', { name: /read me/i })
    .getByRole('button', { name: /close read me/i })
    .click()
  await expect(page.getByRole('dialog', { name: /read me/i })).toHaveCount(0)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Puzzle' }).click()
  await expect(page.getByRole('dialog', { name: /puzzle/i })).toBeVisible()

  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Home' }).click()

  await expect(page.getByRole('dialog', { name: /puzzle/i })).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: /read me/i })).toBeVisible()
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
})

test('File ▸ Terminal opens the Terminal window', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Terminal' }).click()
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
})

test('Apple ▸ About This Portfolio opens the About dialog', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'About This Portfolio' }).click()
  const about = page.getByRole('dialog', { name: /about this portfolio/i })
  await expect(about).toBeVisible()
  await expect(about.getByText('Total Memory')).toBeVisible()
})

test('no serious axe violations with a menu open', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'File' }).click()
  await expect(page.getByRole('menu', { name: 'File' })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('the menus are keyboard navigable', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'File' }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitem', { name: 'Résumé' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('menu', { name: 'Edit' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('Special ▸ Shut Down shows the safe-to-power-off screen, then a click restarts', async ({
  page,
}) => {
  await boot(page)
  await page.getByRole('button', { name: 'Special' }).click()
  await page.getByRole('menuitem', { name: 'Shut Down' }).click()
  await expect(page.getByText(/safe to turn off/i)).toBeVisible({ timeout: 4000 })
  await page.getByText(/safe to turn off/i).click()
  await expect(page.getByText('Welcome to Macintosh')).toBeVisible({ timeout: 4000 })
})

test('Edit ▸ Select All puts a non-empty selection on the front window', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByRole('menuitem', { name: 'Select All' }).click()
  await page.waitForTimeout(150)
  const len = await page.evaluate(() => (window.getSelection()?.toString() ?? '').length)
  expect(len).toBeGreaterThan(50)
})
