import { chromium } from '@playwright/test';
import path from 'path';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto('http://localhost:3001/sign-in', { waitUntil: 'domcontentloaded', timeout: 15000 });
// Wait for Clerk's sign-in widget to appear
await page.waitForSelector('input[name="identifier"], .cl-rootBox, form', { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(2000);

const outPath = path.join(process.cwd(), 'dashboard-signin.png');
await page.screenshot({ path: outPath });
console.log('url:', page.url());
await browser.close();
