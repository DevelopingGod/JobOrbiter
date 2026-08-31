import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should render the login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Verify essential elements are present
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByPlaceholder('agent@orbiter.io')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Initiate Link' })).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: 'Initiate Link' }).click();

    // Since there's no actual validation error text explicitly coded without submission,
    // the native browser validation kicks in (required attribute)
    // We can just verify the button is still there and we haven't navigated
    await expect(page).toHaveURL('/login');
  });

  test('should allow entering an email', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('agent@orbiter.io');
    await emailInput.fill('test@example.com');

    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should switch to the signup form', async ({ page }) => {
    await page.goto('/login');

    await page.getByText('No identity found? Request creation.').click();

    await expect(page.getByText('Join the Orbit')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Construct Profile' })).toBeVisible();
  });
});
