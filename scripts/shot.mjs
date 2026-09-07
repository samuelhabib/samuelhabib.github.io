import { chromium } from '@playwright/test'
const out = process.env.CLAUDE_JOB_DIR + '/tmp'
const b = await chromium.launch()
for (const [name, w, h] of [['desktop', 1280, 800], ['mobile', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto('http://localhost:4173/')
  await p.waitForTimeout(700)
  await p.screenshot({ path: `${out}/shot-${name}.png` })
  await p.close()
}
await b.close()
console.log('shots written to', out)
