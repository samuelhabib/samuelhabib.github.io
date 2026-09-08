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

test('opening the write-up moves focus into the Project Notes window', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: /full write-up/i }).click()
  const notes = page.getByRole('dialog', { name: 'Project Notes' })
  await expect(notes).toBeVisible()
  // focus landed inside the new window, not left on the now-obscured deck button
  await expect(notes).toContainText('Provider Directory')
  const focusedInNotes = await notes.evaluate((el) => el.contains(document.activeElement))
  expect(focusedInNotes).toBe(true)
})

test('?open=writeup&slug= deep-links straight to a project write-up', async ({ page }) => {
  await page.goto('/?open=writeup&slug=referral-outbound-center')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})
  const notes = page.getByRole('dialog', { name: 'Project Notes' })
  await expect(notes.getByRole('heading', { level: 2, name: 'Referral Outbound Center' })).toBeVisible()
})

test('opening the write-up for a different project swaps the window content', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: /full write-up/i }).click()
  const notes = page.getByRole('dialog', { name: 'Project Notes' })
  await expect(notes.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()

  // close it, jump to another project in the deck, open its write-up
  await notes.getByRole('button', { name: 'Close Project Notes' }).click()
  await expect(notes).toBeHidden()

  const deck = page.getByRole('dialog', { name: /projects/i })
  await deck.getByRole('group', { name: /projects deck/i }).click()
  await page.keyboard.press('Home')
  await deck.getByRole('button', { name: /referral outbound center/i }).click()
  await page.getByRole('button', { name: /full write-up/i }).click()

  await expect(notes.getByRole('heading', { level: 2, name: 'Referral Outbound Center' })).toBeVisible()
  await expect(notes.getByRole('heading', { level: 2, name: 'Provider Directory' })).toHaveCount(0)
})
