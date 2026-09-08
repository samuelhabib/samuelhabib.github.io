import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Build receipts for the "About This Portfolio" window. Resolved once at config
// load (build and test alike); every one degrades to a safe default if git or
// the shell is unavailable.
const sh = (cmd: string, fallback: string) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return fallback
  }
}
const commitCount = sh('git rev-list --count HEAD', '0')
const testCount = sh(
  "grep -rE '^[[:space:]]*(it|test)\\(' src tests --include='*.test.ts' --include='*.test.tsx' --include='*.spec.ts' | wc -l",
  '0',
).replace(/\D/g, '')

export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __COMMIT_COUNT__: JSON.stringify(commitCount),
    __TEST_COUNT__: JSON.stringify(testCount),
    __REPO_URL__: JSON.stringify('https://github.com/samuelhabib/samuelhabib.github.io'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: false,
    // Vitest owns src/**; Playwright owns tests/**.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
  },
})
