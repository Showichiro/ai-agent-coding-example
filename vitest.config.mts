import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts', './vitest.setup.ts'],
    globals: true,
    pool: 'forks',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '__tests__/**',
        '*.config.*',
        '*.setup.*',
        'coverage/**',
        'dist/**',
        '.next/**'
      ]
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
      VITEST_MOCK_PRISMA: 'false'
    }
  },
})