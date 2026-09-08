import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/?open=projects&stack=provider-directory')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
  await expect(page.getByRole('dialog', { name: /projects/i })).toBeVisible()
}

test('Full write-up opens the project detail in its own window', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: /full write-up/i }).click()
  const notes = page.getByRole('dialog', { name: 'Project Notes' })
  await expect(notes.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
  await expect(notes.getByText(/40,000\+ rows across six rosters/i)).toBeVisible()
})
