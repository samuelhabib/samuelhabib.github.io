import { test, expect } from '@playwright/test'

test('cursors communicate affordance', async ({ page }) => {
  await page.goto('/')

  const titlebar = page.locator('[data-testid="titlebar"]').first()
  await expect(titlebar).toHaveCSS('cursor', 'grab')

  const grow = page.locator('.grow-box').first()
  await expect(grow).toHaveCSS('cursor', 'nwse-resize')

  await page.getByRole('button', { name: 'Terminal' }).dblclick()
  await expect(page.locator('[data-terminal]')).toHaveCSS('cursor', 'text')
})
