import { test, expect } from '@playwright/test';

test.describe('Dashboard & Protected Routes', () => {
  test('should redirect unauthenticated users from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // The middleware or server component should redirect to login
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users from /dashboard/profile to /login', async ({ page }) => {
    await page.goto('/dashboard/profile');
    
    // The middleware or server component should redirect to login
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

test.describe('Landing Page', () => {
  test('should render the landing page hero section correctly', async ({ page }) => {
    await page.goto('/');

    // Verify main hero elements
    await expect(page.getByText('Job Orbiter').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Initialize Orbiter' })).toBeVisible();
  });
});
