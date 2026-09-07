import { chromium } from '@playwright/test'

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
await p.goto('http://localhost:4173/')
// Let the boot sequence finish on its own, then confirm it is gone.
await p.waitForTimeout(2000)
await p
  .getByText('Welcome to Macintosh')
  .waitFor({ state: 'detached', timeout: 4000 })
  .catch(() => {})
await p.getByRole('dialog', { name: /read me/i }).waitFor({ state: 'visible' })
await p.waitForTimeout(300)
await p.screenshot({ path: 'public/og.png' })
await b.close()
console.log('wrote public/og.png')
