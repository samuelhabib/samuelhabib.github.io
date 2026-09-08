import { existsSync, readFileSync } from 'node:fs'

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const needles = [
  '<h1',
  'Samuel Habib',
  'Referral Outbound Center',
  'Provider Directory',
  'Toronto Metropolitan University',
  'need me watching them',
  'Superpowers workflow',
  'Appearance',
  'Desktop Pattern',
]
const missing = needles.filter((n) => !html.includes(n))
if (missing.length) {
  console.error('dist/index.html missing pre-rendered content:', missing)
  process.exit(1)
}

if (!existsSync(new URL('../dist/Resume.pdf', import.meta.url))) {
  console.error('dist/Resume.pdf is missing — it must ship at the served root')
  process.exit(1)
}

console.log('OK: dist/index.html contains pre-rendered content')
