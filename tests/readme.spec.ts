import { test, expect } from '@playwright/test'

test('Read Me note is open above the résumé on load', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Space') // skip boot
  const readme = page.getByRole('dialog', { name: /read me/i })
  await expect(readme).toBeVisible()
  await expect(readme.getByText(/i spend most of my day pairing with agents/i)).toBeVisible()
})

test('Read Me content is in the no-JS HTML', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  // A phrase that only appears in the Read Me, not the résumé.
  await expect(page.getByText(/i spend most of my day pairing with agents/i)).toBeVisible()
  await ctx.close()
})
