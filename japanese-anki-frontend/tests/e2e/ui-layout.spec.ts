import { test, expect } from '@playwright/test';

test.describe('UI布局测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面标题', async ({ page }) => {
    await expect(page).toHaveTitle(/日语Anki卡片生成器/);
  });

  test('导航栏显示', async ({ page }) => {
    await expect(page.getByText('日语Anki卡片生成器')).toBeVisible();
    await expect(page.getByText('登录/注册')).toBeVisible();
  });

  test('主布局结构', async ({ page }) => {
    // 检查主容器
    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();
    
    // 检查左右布局
    const leftPanel = page.locator('main > div').first();
    const rightPanel = page.locator('main > div').last();
    
    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
  });

  test('响应式布局', async ({ page }) => {
    // 桌面布局应该是水平排列
    const mainContainer = page.locator('main > div');
    await expect(mainContainer).toHaveClass(/flex/);
    
    // 移动设备布局应该是垂直排列
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // 检查元素是否仍然可见
    await expect(page.getByText('输入日语文本')).toBeVisible();
    await expect(page.getByText('选择单词书')).toBeVisible();
    await expect(page.getByText('任务队列')).toBeVisible();
  });

  test('卡片样式', async ({ page }) => {
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();
    
    // 检查卡片样式
    await expect(cards.first()).toHaveClass(/bg-white/);
    await expect(cards.first()).toHaveClass(/rounded-lg/);
    await expect(cards.first()).toHaveClass(/shadow-sm/);
  });

  test('输入框样式', async ({ page }) => {
    const textarea = page.getByPlaceholder('在这里输入或粘贴日语文本...');
    await expect(textarea).toBeVisible();
    
    // 检查样式
    await expect(textarea).toHaveClass(/border/);
    await expect(textarea).toHaveClass(/rounded-md/);
    await expect(textarea).toHaveClass(/resize-none/);
  });

  test('按钮样式', async ({ page }) => {
    const button = page.getByRole('button', { name: '开始制作单词卡片' });
    await expect(button).toBeVisible();
    
    // 检查样式
    await expect(button).toHaveClass(/btn-primary/);
    await expect(button).toHaveClass(/px-6/);
    await expect(button).toHaveClass(/py-3/);
  });

  test('复选框样式', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible();
    
    // 检查默认选择
    await expect(checkboxes.filter({ hasText: 'N4' })).toBeChecked();
    await expect(checkboxes.filter({ hasText: 'N5' })).toBeChecked();
  });

  test('页面整体风格', async ({ page }) => {
    // 检查背景色
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(249, 250, 251)');
    
    // 检查字体
    await expect(page.locator('body')).toHaveCSS('font-family', /system-ui/);
    
    // 检查间距
    const mainContainer = page.locator('main');
    await expect(mainContainer).toHaveClass(/py-8/);
  });

  test('空状态显示', async ({ page }) => {
    // 任务队列为空时的显示
    await expect(page.getByText('暂无任务')).toBeVisible();
    await expect(page.getByText('创建任务后将显示在这里')).toBeVisible();
  });

  test('滚动功能', async ({ page }) => {
    const textarea = page.getByPlaceholder('在这里输入或粘贴日语文本...');
    
    // 输入大量文本测试滚动
    const longText = '今日はとても良い天気ですね。'.repeat(50);
    await textarea.fill(longText);
    
    // 检查是否有滚动条
    const scrollHeight = await textarea.evaluate(el => el.scrollHeight);
    const clientHeight = await textarea.evaluate(el => el.clientHeight);
    
    expect(scrollHeight).toBeGreaterThan(clientHeight);
  });
});