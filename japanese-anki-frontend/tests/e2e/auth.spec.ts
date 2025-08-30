import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('display login/register button', async ({ page }) => {
    await expect(page.getByText('Login/Register')).toBeVisible();
  });

  test('open login modal', async ({ page }) => {
    await page.getByText('Login/Register').click();
    await expect(page.getByText('Login')).toBeVisible();
    await expect(page.getByText('Username')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();
  });

  test('switch to register mode', async ({ page }) => {
    await page.getByText('Login/Register').click();
    await page.getByText('No account? Register').click();
    await expect(page.getByText('Register')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
  });

  test('user registration flow', async ({ page }) => {
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123'
    };

    await page.getByText('Login/Register').click();
    await page.getByText('No account? Register').click();
    
    await page.getByPlaceholder('Enter username').fill(testUser.username);
    await page.getByPlaceholder('Enter email').fill(testUser.email);
    await page.getByPlaceholder('Enter password').fill(testUser.password);
    
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Wait for registration to complete
    await page.waitForTimeout(2000);
    
    // Check if login successful
    await expect(page.getByText(`Welcome, ${testUser.username}`)).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('user login flow', async ({ page }) => {
    // Use already registered test user
    const testUser = {
      username: 'testuser',
      password: 'testpass123'
    };

    await page.getByText('Login/Register').click();
    
    await page.getByPlaceholder('Enter username').fill(testUser.username);
    await page.getByPlaceholder('Enter password').fill(testUser.password);
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // Check if login successful
    await expect(page.getByText(`Welcome, ${testUser.username}`)).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('user logout function', async ({ page }) => {
    // Login first
    const testUser = {
      username: 'testuser',
      password: 'testpass123'
    };

    await page.getByText('Login/Register').click();
    await page.getByPlaceholder('Enter username').fill(testUser.username);
    await page.getByPlaceholder('Enter password').fill(testUser.password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForTimeout(2000);
    
    // Logout
    await page.getByText('Logout').click();
    
    // Check if returned to unlogged state
    await expect(page.getByText('Login/Register')).toBeVisible();
  });
});