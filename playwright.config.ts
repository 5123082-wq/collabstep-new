import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './apps/web/tests/e2e',
  webServer: {
    command: 'pnpm --filter @collabverse/web dev',
    url: 'http://localhost:3000',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_DISABLE_VERSION_CHECK: '1',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  }
});
