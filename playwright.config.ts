import { defineConfig } from '@playwright/test'

// E2E runs against the built + previewed site, not the dev server: the whole
// premise is that the served HTML is real, so every test exercises dist/.
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
