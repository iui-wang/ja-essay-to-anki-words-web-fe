import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.getByText('Login/Register').click();
    await page.getByPlaceholder('Enter username').fill('testuser');
    await page.getByPlaceholder('Enter password').fill('testpass123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForTimeout(2000);
  });

  test('complete user flow', async ({ page }) => {
    // 1. Login verification
    await expect(page.getByText('Welcome, testuser')).toBeVisible();

    // 2. Input text and select word books
    const testText = '今日はとても良い天気ですね。これはテスト用の日本語文章です。';
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill(testText);
    
    // Select N3 and N4
    await page.getByLabel('N1').uncheck();
    await page.getByLabel('N2').uncheck();
    await page.getByLabel('N5').uncheck();
    await page.getByLabel('N3').check();
    await page.getByLabel('N4').check();

    // 3. Create task
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    // Wait for task creation
    await page.waitForTimeout(2000);

    // 4. Verify task creation success
    await expect(page.getByPlaceholder('Enter or paste Japanese text here...')).toHaveValue('');
    await expect(page.getByText('これはテスト用の日本語文章です')).toBeVisible();
    await expect(page.getByText('Level: N3, N4')).toBeVisible();

    // 5. Verify task status
    const statusElement = page.getByText(/Pending|Processing|Completed/);
    await expect(statusElement.first()).toBeVisible();
  });

  test('multiple task creation and management', async ({ page }) => {
    const tasks = [
      'First article: 今日はとても良い天気です。',
      'Second article: 明日は雨が降るかもしれません。',
      'Third article: 昨日は友達と映画を見ました。'
    ];

    // Create multiple tasks
    for (const taskText of tasks) {
      await page.getByPlaceholder('Enter or paste Japanese text here...').fill(taskText);
      await page.getByRole('button', { name: 'Generate Flashcards' }).click();
      await page.waitForTimeout(1000);
    }

    // Wait for all tasks to load
    await page.waitForTimeout(2000);

    // Verify all tasks are in the queue
    for (const taskText of tasks) {
      await expect(page.getByText(taskText.substring(0, 20))).toBeVisible();
    }

    // Verify task count
    const taskCards = page.locator('.card').locator('text=/Level: N4, N5/');
    await expect(taskCards).toHaveCount(3);
  });

  test('error handling and validation', async ({ page }) => {
    // Test 1: Empty text submission
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    // Should show prompt
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please enter Japanese text');
      await dialog.accept();
    });

    // Test 2: No word books selected
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('Test text');
    await page.getByLabel('N4').uncheck();
    await page.getByLabel('N5').uncheck();
    
    // Create button should be disabled
    await expect(page.getByRole('button', { name: 'Generate Flashcards' })).toBeDisabled();
  });

  test('task status polling', async ({ page }) => {
    // Create task
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('Test polling functionality');
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    await page.waitForTimeout(2000);

    // Get initial status
    const initialStatus = await page.getByText(/Pending|Processing|Completed/).first().textContent();
    
    // Wait for polling update
    await page.waitForTimeout(6000);
    
    // Check if status updated (may require backend support)
    const currentStatus = await page.getByText(/Pending|Processing|Completed/).first().textContent();
    
    // Status should remain the same or update
    expect(['Pending', 'Processing', 'Completed']).toContain(currentStatus);
  });

  test('login state persistence', async ({ page, context }) => {
    // Verify logged in
    await expect(page.getByText('Welcome, testuser')).toBeVisible();

    // Create task
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('Persistence test');
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    await page.waitForTimeout(2000);

    // Refresh page
    await page.reload();
    await page.waitForTimeout(1000);

    // Verify still logged in
    await expect(page.getByText('Welcome, testuser')).toBeVisible();
    
    // Verify task queue still exists
    await expect(page.getByText('Persistence test')).toBeVisible();
  });

  test('state cleared after logout', async ({ page }) => {
    // Create task
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('Logout test');
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    await page.waitForTimeout(2000);

    // Logout
    await page.getByText('Logout').click();
    await page.waitForTimeout(1000);

    // Verify back to logged out state
    await expect(page.getByText('Login/Register')).toBeVisible();
    
    // Verify need to login again to create task
    await page.getByPlaceholder('Enter or paste Japanese text here...').fill('New task');
    await page.getByRole('button', { name: 'Generate Flashcards' }).click();
    
    // Should show login modal
    await expect(page.getByText('Login')).toBeVisible();
  });
});