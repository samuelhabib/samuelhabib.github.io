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

test('Apple ▸ Puzzle opens the Puzzle window', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Puzzle' }).click()
  const puzzle = page.getByRole('dialog', { name: /puzzle/i })
  await expect(puzzle).toBeVisible()
  await expect(puzzle.getByRole('button', { name: 'Shuffle' })).toBeVisible()
})

test('Apple ▸ Calculator opens and adds up', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Calculator' }).click()
  const calc = page.getByRole('dialog', { name: /calculator/i })
  await expect(calc).toBeVisible()
  for (const label of ['9', '+', '9', '=']) {
    await calc.getByRole('button', { name: label }).click()
  }
  await expect(calc.getByRole('status')).toHaveText('18')
})

test('right-clicking the bare desktop opens a contextual menu', async ({ page }) => {
  await boot(page)
  await page.mouse.click(900, 150, { button: 'right' })
  const menu = page.getByRole('menu', { name: 'Desktop' })
  await expect(menu).toBeVisible()
  await menu.getByRole('menuitem', { name: 'About This Portfolio' }).click()
  await expect(page.getByRole('dialog', { name: /about this portfolio/i })).toBeVisible()
  await expect(menu).toBeHidden()
})

test('the desktop context menu is not offered over a window', async ({ page }) => {
  await boot(page)
  const resume = page.getByRole('dialog', { name: /résumé/i })
  const box = await resume.boundingBox()
  await page.mouse.click(box!.x + 40, box!.y + 60, { button: 'right' })
  await expect(page.getByRole('menu', { name: 'Desktop' })).toHaveCount(0)
})

test('no serious axe violations with the Puzzle open', async ({ page }) => {
  await boot(page)
  await page.getByRole('button', { name: 'Apple menu' }).click()
  await page.getByRole('menuitem', { name: 'Puzzle' }).click()
  await expect(page.getByRole('dialog', { name: /puzzle/i })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('dragging a window onto the Trash closes it', async ({ page }) => {
  await boot(page)
  const readme = page.getByRole('dialog', { name: /read me/i })
  await expect(readme).toBeVisible()
  const bar = readme.getByTestId('titlebar')
  const trash = page.locator('[data-trash]')
  const from = await bar.boundingBox()
  const to = await trash.boundingBox()
  await page.mouse.move(from!.x + 30, from!.y + from!.height / 2)
  await page.mouse.down()
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 24 })
  await page.mouse.up()
  await expect(readme).toHaveCount(0)
})

test('a short drag that misses the Trash keeps the window open', async ({ page }) => {
  await boot(page)
  const readme = page.getByRole('dialog', { name: /read me/i })
  const bar = readme.getByTestId('titlebar')
  const from = await bar.boundingBox()
  await page.mouse.move(from!.x + 30, from!.y + from!.height / 2)
  await page.mouse.down()
  await page.mouse.move(from!.x + 90, from!.y + from!.height / 2 + 20, { steps: 12 })
  await page.mouse.up()
  await expect(readme).toBeVisible()
})
