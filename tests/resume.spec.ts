import { test, expect } from '@playwright/test'

test('résumé window is open on load with real content', async ({ page }) => {
  await page.goto('/')
  const dialog = page.getByRole('dialog', { name: /résumé/i })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { level: 1, name: /samuel habib/i })).toBeVisible()
  await expect(dialog.getByText(/referral outbound center/i)).toBeVisible()
})

test('résumé content is in the served HTML (no-JS view)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /samuel habib/i })).toBeVisible()
  await expect(page.getByText(/2B\+ records an hour/i)).toBeVisible()
  await ctx.close()
})
