import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', use: { baseURL: 'http://127.0.0.1:3000', launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] } }, webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3000', reuseExistingServer: true }, workers: 2 });
