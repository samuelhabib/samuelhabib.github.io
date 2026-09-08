import { test, expect } from '@playwright/test'

test('projects content is in the served HTML (no-JS view)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
  await expect(page.getByText(/40,000\+ rows across six rosters/i).first()).toBeVisible()
  await ctx.close()
})
