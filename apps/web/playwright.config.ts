import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@playwright/test';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  retries: process.env.CI ? 2 : 0,
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command:
          'sh -c "NODE_ENV=production HOSTNAME=127.0.0.1 PORT=3000 node apps/web/.next/standalone/apps/web/server.js"',
        cwd: rootDir,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
