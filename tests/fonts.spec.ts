import { test, expect } from '@playwright/test'

// document.fonts.load() both fetches the file and parses it, so a resolved
// promise with a non-empty result proves the woff2 is valid and self-hosted.
async function loads(page: import('@playwright/test').Page, family: string) {
  return page.evaluate(async (fam) => {
    const fs = (document as unknown as { fonts: FontFaceSet }).fonts
    const faces = await fs.load(`16px "${fam}"`)
    return faces.length > 0
  }, family)
}

test('Chicago font face loads from self-hosted woff2', async ({ page }) => {
  await page.goto('/')
  expect(await loads(page, 'Chicago')).toBe(true)
})

test('NewYork and Monaco faces load from self-hosted woff2', async ({ page }) => {
  await page.goto('/')
  expect(await loads(page, 'NewYork')).toBe(true)
  expect(await loads(page, 'Monaco')).toBe(true)
})
