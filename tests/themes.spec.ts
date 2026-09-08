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

async function openAppearance(page: Page) {
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: /Appearance/ }).click()
  await expect(page.getByRole('dialog', { name: 'Appearance' })).toBeVisible()
}

test('theme switch persists across reload with no flash', async ({ page }) => {
  await ready(page)
  await openAppearance(page)
  await page.getByRole('radio', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/theme-dark/)

  await page.reload()
  // the <head> init script must set the class before first paint
  await expect(page.locator('html')).toHaveClass(/theme-dark/)
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
  const winBg = await page.evaluate(
    () => getComputedStyle(document.getElementById('win-resume')!).backgroundColor,
  )
  expect(winBg).toBe('rgb(0, 0, 0)')
})

test('a CRT theme tints without shoving the menu bar (containing-block guard)', async ({ page }) => {
  await ready(page)
  await openAppearance(page)
  await page.getByRole('radio', { name: 'CRT Amber' }).click()
  await expect(page.locator('html')).toHaveClass(/theme-crt-amber/)

  const top = (await page.locator('[data-testid="menubar"]').boundingBox())!.y
  expect(top).toBe(0)
  const tint = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div[aria-hidden]')].find(
      (d) => getComputedStyle(d).mixBlendMode === 'multiply',
    )
    return el ? getComputedStyle(el).backgroundColor : null
  })
  expect(tint).toBe('rgb(255, 176, 0)')
})

test('desktop pattern density changes the stipple', async ({ page }) => {
  await ready(page)
  await openAppearance(page)
  await page.getByRole('radio', { name: /Dense 75%/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-pattern', '75')
  const img = await page.evaluate(
    () => getComputedStyle(document.querySelector('.desktop')!).backgroundImage,
  )
  expect(img).toContain('conic-gradient')

  await page.getByRole('radio', { name: 'None' }).click()
  const none = await page.evaluate(
    () => getComputedStyle(document.querySelector('.desktop')!).backgroundImage,
  )
  expect(none).toBe('none')
})
