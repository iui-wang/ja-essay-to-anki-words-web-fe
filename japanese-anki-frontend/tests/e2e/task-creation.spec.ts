import { test, expect } from '@playwright/test';

test.describe('Task Creation Function', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.getByText('Login/Register').click();
    await page.getByPlaceholder('Enter username').fill('testuser');
    await page.getByPlaceholder('Enter password').fill('testpass123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForTimeout(2000);
  });

  test('display text input area', async ({ page }) => {
    await expect(page.getByText('Enter Japanese Text')).toBeVisible();
    await expect(page.getByPlaceholder('Enter or paste Japanese text here...')).toBeVisible();
  });

  test('display word book selection', async ({ page }) => {
    await expect(page.getByText('Select Word Books')).toBeVisible();
    await expect(page.getByText('N1')).toBeVisible();
    await expect(page.getByText('N2')).toBeVisible();
    await expect(page.getByText('N3')).toBeVisible();
    await expect(page.getByText('N4')).toBeVisible();
    await expect(page.getByText('N5')).toBeVisible();
  });

  test('select word books', async ({ page }) => {
    // Deselect default choices
    await page.getByLabel('N4').uncheck();
    await page.getByLabel('N5').uncheck();
    
    // Select N1 and N2
    await page.getByLabel('N1').check();
    await page.getByLabel('N2').check();
    
    // Verify selection
    await expect(page.getByLabel('N1')).toBeChecked();
    await expect(page.getByLabel('N2')).toBeChecked();
    await expect(page.getByLabel('N4')).not.toBeChecked();
  });

  test('input Japanese text', async ({ page }) => {
    const testText = '今日はとても良い天気ですね。外に出かけたくなります。';
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill(testText);
    
    await expect(page.getByPlaceholder('Enter or paste Japanese text here...')).toHaveValue(testText);
  });

  test('unlogged user clicking create task shows login prompt', async ({ page }) => {
    // Logout
    await page.getByText('Logout').click();
    await page.waitForTimeout(1000);
    
    // Fill content
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('Test text');
    
    // Click create task
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    // Should display login modal
    await expect(page.getByText('Login')).toBeVisible();
  });

  test('create button disabled when no word books selected', async ({ page }) => {
    // Deselect all choices
    await page.getByLabel('N4').uncheck();
    await page.getByLabel('N5').uncheck();
    
    // Fill text
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('Test text');
    
    // Create button should be disabled
    await expect(page.getByRole('button', { name: 'Generate Flashcards' })).toBeDisabled();
  });

  test('create task flow', async ({ page }) => {
    const testText = '今日はとても良い天気ですね。外に出かけたくなります。でも、明日は雨が降るかもしれません。';
    
    // Select N4 and N5
    await page.getByLabel('N1').uncheck();
    await page.getByLabel('N2').uncheck();
    await page.getByLabel('N3').uncheck();
    await page.getByLabel('N4').check();
    await page.getByLabel('N5').check();
    
    // Input text
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill(testText);
    
    // Create task
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    // Wait for task creation
    await page.waitForTimeout(2000);
    
    // Check if text area is cleared
    await expect(page.getByPlaceholder('Enter or paste Japanese text here...')).toHaveValue('');
    
    // Check if task is in queue
    await expect(page.getByText('Task Queue')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
  });
});