import { test, expect } from '@playwright/test'

test('cursors communicate affordance', async ({ page }) => {
  await page.goto('/')
  await page
    .getByText('Welcome to Macintosh')
    .waitFor({ state: 'detached', timeout: 6000 })
    .catch(() => {})

  const titlebar = page.locator('[data-testid="titlebar"]').first()
  await expect(titlebar).toHaveCSS('cursor', 'grab')

  const grow = page.locator('.grow-box').first()
  await expect(grow).toHaveCSS('cursor', 'nwse-resize')

  await page.locator('[data-window="terminal"]').dblclick()
  await expect(page.locator('[data-terminal]')).toHaveCSS('cursor', 'text')
})
