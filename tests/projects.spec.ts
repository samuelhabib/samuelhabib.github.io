import { test, expect } from '@playwright/test'

test('projects content is in the served HTML (no-JS view)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'Provider Directory' })).toBeVisible()
  await expect(page.getByText(/40,000\+ rows across six rosters/i).first()).toBeVisible()
  await ctx.close()
})

test.describe('deck', () => {
  test('the Projects icon opens the deck on the contents slide', async ({ page }) => {
    await page.goto('/')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await page.getByRole('button', { name: 'Projects' }).dblclick()
    const deck = page.getByRole('dialog', { name: /projects/i })
    await expect(deck).toBeVisible()
    await expect(deck.getByRole('heading', { level: 2, name: 'Projects' })).toBeVisible()
    await deck.getByRole('button', { name: 'Next ▶' }).click()
    await expect(deck.getByRole('heading', { level: 2, name: 'Work' })).toBeVisible()
  })

  test('Present mode fills the screen and Escape returns to the window', async ({ page }) => {
    await page.goto('/')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await page.getByRole('button', { name: 'Projects' }).dblclick()
    const deck = page.getByRole('dialog', { name: /projects/i })
    await deck.getByRole('button', { name: '▶ Present' }).click()
    const show = page.getByRole('dialog', { name: 'Presentation' })
    await expect(show).toBeVisible()
    // menu bar is covered
    await expect(show).toHaveCSS('position', 'fixed')
    await page.keyboard.press('ArrowRight')
    await expect(show.getByRole('heading', { level: 2, name: 'Work' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(show).toBeHidden()
    await expect(deck).toBeVisible()
  })

  test('Terminal `projects crisis` jumps the deck to that stack', async ({ page }) => {
    await page.goto('/')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await page.getByRole('button', { name: 'Terminal' }).dblclick()
    const input = page.getByRole('textbox', { name: /terminal input/i })
    await input.fill('projects crisis')
    await input.press('Enter')
    await expect(
      page.getByRole('dialog', { name: /projects/i }).getByRole('heading', {
        level: 2,
        name: 'Mental Health Crisis Detection',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('dialog', { name: /projects/i }).getByText(/slide 1 of/i),
    ).toBeVisible()
  })

  test('deep link ?open=projects&stack= lands on that stack', async ({ page }) => {
    await page.goto('/?open=projects&stack=referral-outbound-center')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await expect(
      page.getByRole('dialog', { name: /projects/i }).getByRole('heading', {
        level: 2,
        name: 'Referral Outbound Center',
      }),
    ).toBeVisible()
  })

  test('under reduced motion the deck advances with an instant swap (no dissolve overlay)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await page.getByRole('button', { name: 'Projects' }).dblclick()
    const deck = page.getByRole('dialog', { name: /projects/i })
    await deck.getByRole('button', { name: 'Next ▶' }).click()
    await expect(deck.getByRole('heading', { level: 2, name: 'Work' })).toBeVisible()
    expect(await deck.locator('[data-transitioning]').count()).toBe(0)
  })

  test('with motion, the dissolve overlay appears then clears (no stranded slide)', async ({
    page,
  }) => {
    await page.goto('/')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await page.getByRole('button', { name: 'Projects' }).dblclick()
    const deck = page.getByRole('dialog', { name: /projects/i })
    await deck.getByRole('button', { name: 'Next ▶' }).click()
    await expect(deck.locator('[data-transitioning]')).toHaveCount(1)
    await expect(deck.locator('[data-transitioning]')).toHaveCount(0, { timeout: 2000 })
    await expect(deck.getByRole('heading', { level: 2, name: 'Work' })).toBeVisible()
  })

  test('no serious axe violations with the deck open', async ({ page }) => {
    const AxeBuilder = (await import('@axe-core/playwright')).default
    await page.goto('/')
    await page
      .getByText('Welcome to Macintosh')
      .waitFor({ state: 'detached', timeout: 6000 })
      .catch(() => {})
    await page.getByRole('button', { name: 'Projects' }).dblclick()
    await expect(page.getByRole('dialog', { name: /projects/i })).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    )
    expect(serious).toEqual([])
  })
})
