import { chromium } from '@playwright/test'
const out = process.env.CLAUDE_JOB_DIR + '/tmp'
const b = await chromium.launch()
for (const [name, w, h] of [['desktop', 1280, 800], ['mobile', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:4173/')
  await p.waitForTimeout(2200)
  await p.getByText('Welcome to Macintosh').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {})
  await p.waitForTimeout(200)
  await p.screenshot({ path: `${out}/shot-${name}.png` })
  await p.close()
}
await b.close()
console.log('shots written')
