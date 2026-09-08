import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function ready(page: Page) {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
  await expect(page.getByRole('dialog', { name: /résumé/i })).toBeVisible()
}

test('File ▸ Skills opens the Chooser-style skills window', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Skills' }).click()

  const win = page.getByRole('dialog', { name: 'Skills' })
  await expect(win).toBeVisible()

  const list = win.getByRole('listbox', { name: /categor/i })
  await expect(list.getByRole('option', { name: 'Languages' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  // first group's detail is shown
  await expect(win.getByRole('group', { name: 'Languages' }).getByText('Python')).toBeVisible()
})

test('the group list is keyboard navigable and selection follows focus', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Skills' }).click()
  const win = page.getByRole('dialog', { name: 'Skills' })

  await win.getByRole('option', { name: 'Languages' }).focus()
  await page.keyboard.press('ArrowDown')
  const second = win.getByRole('option', { name: 'Backend and data' })
  await expect(second).toBeFocused()
  await expect(second).toHaveAttribute('aria-selected', 'true')
  await expect(win.getByRole('group', { name: 'Backend and data' }).getByText('PostgreSQL')).toBeVisible()
})

test('no serious axe violations with the Skills window open', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Skills' }).click()
  await expect(page.getByRole('dialog', { name: 'Skills' })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('skills ship as semantic HTML with JavaScript disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  const section = page.locator('#skills')
  await expect(section.getByRole('heading', { level: 2, name: /^skills$/i })).toBeVisible()
  await expect(section.locator('dt', { hasText: 'Search and AI' })).toBeVisible()
  await expect(section.getByText('RoBERTa')).toBeVisible()
  await ctx.close()
})
