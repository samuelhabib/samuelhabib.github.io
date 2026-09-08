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

test('File ▸ Get Info describes the front window', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'Projects' }).dblclick()
  await expect(page.getByRole('dialog', { name: /projects/i })).toBeVisible()
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Get Info' }).click()

  const info = page.getByRole('dialog', { name: 'Info' })
  await expect(info.getByText('Slide deck')).toBeVisible()
  await expect(info.getByText('Projects Info')).toBeVisible()
  await expect(info.getByText(/arrow keys/i)).toBeVisible()
})

test('Cmd-I opens Get Info for the front window', async ({ page }) => {
  await ready(page)
  await page.keyboard.press('Meta+i')
  const info = page.getByRole('dialog', { name: 'Info' })
  await expect(info.getByText('Read Me Info')).toBeVisible()
})

test('Get Info follows whichever window is front', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'File' }).click()
  await page.getByRole('menuitem', { name: 'Get Info' }).click()
  // Read Me is front on load
  const info = page.getByRole('dialog', { name: 'Info' })
  await expect(info.getByText('Read Me Info')).toBeVisible()
})
