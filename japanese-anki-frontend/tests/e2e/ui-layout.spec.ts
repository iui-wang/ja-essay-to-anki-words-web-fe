import { test, expect } from '@playwright/test';

test.describe('UI Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Japanese Anki Flashcard Generator/);
  });

  test('navigation bar display', async ({ page }) => {
    await expect(page.getByText('Japanese Anki Flashcard Generator')).toBeVisible();
    await expect(page.getByText('Login/Register')).toBeVisible();
  });

  test('main layout structure', async ({ page }) => {
    // Check main container
    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();
    
    // Check left-right layout
    const leftPanel = page.locator('main > div').first();
    const rightPanel = page.locator('main > div').last();
    
    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
  });

  test('responsive layout', async ({ page }) => {
    // Desktop layout should be horizontal
    const mainContainer = page.locator('main > div');
    await expect(mainContainer).toHaveClass(/flex/);
    
    // Mobile layout should be vertical
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check if elements are still visible
    await expect(page.getByText('Enter Japanese Text')).toBeVisible();
    await expect(page.getByText('Select Word Books')).toBeVisible();
    await expect(page.getByText('Task Queue')).toBeVisible();
  });

  test('card styles', async ({ page }) => {
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();
    
    // Check card styles
    await expect(cards.first()).toHaveClass(/bg-white/);
    await expect(cards.first()).toHaveClass(/rounded-lg/);
    await expect(cards.first()).toHaveClass(/shadow-sm/);
  });

  test('input box styles', async ({ page }) => {
    const textarea = page.getByPlaceholder('Enter or paste Japanese text here...');
    await expect(textarea).toBeVisible();
    
    // Check styles
    await expect(textarea).toHaveClass(/border/);
    await expect(textarea).toHaveClass(/rounded-md/);
    await expect(textarea).toHaveClass(/resize-none/);
  });

  test('button styles', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Generate Flashcards' });
    await expect(button).toBeVisible();
    
    // Check styles
    await expect(button).toHaveClass(/btn-primary/);
    await expect(button).toHaveClass(/px-6/);
    await expect(button).toHaveClass(/py-3/);
  });

  test('checkbox styles', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
    
    // Check default selections
    await expect(checkboxes.filter({ hasText: 'N4' })).toBeChecked();
    await expect(checkboxes.filter({ hasText: 'N5' })).toBeChecked();
  });

  test('overall page style', async ({ page }) => {
    // Check background color
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(249, 250, 251)');
    
    // Check font
    await expect(page.locator('body')).toHaveCSS('font-family', /system-ui/);
    
    // Check spacing
    const mainContainer = page.locator('main');
    await expect(mainContainer).toHaveClass(/py-8/);
  });

  test('empty state display', async ({ page }) => {
    // Display when task queue is empty
    await expect(page.getByText('No tasks yet')).toBeVisible();
    await expect(page.getByText('Tasks will appear here after creation')).toBeVisible();
  });

  test('scrolling functionality', async ({ page }) => {
    const textarea = page.getByPlaceholder('Enter or paste Japanese text here...');
    
    // Input large text to test scrolling
    const longText = '今日はとても良い天気ですね。'.repeat(50);
    await textarea.fill(longText);
    
    // Check if scrollbars appear
    const scrollHeight = await textarea.evaluate(el => el.scrollHeight);
    const clientHeight = await textarea.evaluate(el => el.clientHeight);
    
    expect(scrollHeight).toBeGreaterThan(clientHeight);
  });
});