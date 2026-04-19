import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    headless: false,
    viewport: { width: 1400, height: 900 },
  },
  projects: [
    {
      name: 'electron',
      use: { browserName: 'chromium' },
    },
  ],
});