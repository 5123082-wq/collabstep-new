import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  webServer: {
    command:
      "sh -c 'rm -rf apps/web/.next && pnpm --filter @collabverse/web dev --hostname 127.0.0.1 --port 3000'",
    url: 'http://127.0.0.1:3000',
    timeout: 180000,
    reuseExistingServer: !isCI,
    env: {
      NEXT_DISABLE_VERSION_CHECK: '1',
      NEXT_TELEMETRY_DISABLED: '1',
      NAV_V1: 'on',
      HOSTNAME: '127.0.0.1',
      PORT: '3000'
    }
  }
});
