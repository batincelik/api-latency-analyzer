import { expect, test } from '@playwright/test';

test.describe('operational smoke', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('full flow when E2E_CREDENTIALS provided', async ({ page, request }) => {
    test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'requires E2E_EMAIL and E2E_PASSWORD');

    const api = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3001';
    const health = await request.get(`${api}/api/v1/health`);
    expect(health.ok()).toBeTruthy();

    await page.goto('/register');
    const email = process.env.E2E_EMAIL!;
    const password = process.env.E2E_PASSWORD!;

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Operations overview' })).toBeVisible({
      timeout: 30_000,
    });

    await page.goto('/endpoints/new');
    await page.getByLabel('URL').fill('https://example.com');
    await page.getByRole('button', { name: 'Create monitor' }).click();
    await expect(page).toHaveURL(/\/endpoints\/.+/);
  });
});
