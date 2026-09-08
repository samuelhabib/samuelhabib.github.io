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

async function openTerminal(page: Page) {
  await boot(page)
  await page.getByRole('button', { name: 'Terminal' }).dblclick()
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
}

test('the Terminal icon opens a real Terminal window', async ({ page }) => {
  await openTerminal(page)
  await expect(
    page
      .getByRole('dialog', { name: /terminal/i })
      .getByRole('textbox', { name: /terminal input/i }),
  ).toBeVisible()
})

test('help lists commands; open resume brings the résumé forward', async ({ page }) => {
  await openTerminal(page)
  const input = page.getByRole('textbox', { name: /terminal input/i })
  await input.fill('help')
  await input.press('Enter')
  await expect(page.getByRole('log')).toContainText('experience')

  await input.fill('open resume')
  await input.press('Enter')
  const resume = page.getByRole('dialog', { name: /résumé/i })
  await expect(resume).toBeVisible()
  const resumeZ = await resume.evaluate((el) => Number(getComputedStyle(el).zIndex))
  const termZ = await page
    .getByRole('dialog', { name: /terminal/i })
    .evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(resumeZ).toBeGreaterThan(termZ)
})

test('Escape while typing in the Terminal does not close it', async ({ page }) => {
  await openTerminal(page)
  const input = page.getByRole('textbox', { name: /terminal input/i })
  await input.fill('hal')
  await input.press('Escape')
  await expect(input).toHaveValue('')
  await expect(page.getByRole('dialog', { name: /terminal/i })).toBeVisible()
})

test('no serious axe violations with the Terminal open', async ({ page }) => {
  await openTerminal(page)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
  expect(serious).toEqual([])
})

test('mobile still renders no desktop shell (Terminal included)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: /terminal/i })).toHaveCount(0)
  await expect(page.locator('#main')).toBeVisible()
})
