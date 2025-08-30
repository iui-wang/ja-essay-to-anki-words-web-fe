import { test, expect } from '@playwright/test';

test.describe('用户认证功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('显示登录/注册按钮', async ({ page }) => {
    await expect(page.getByText('登录/注册')).toBeVisible();
  });

  test('打开登录模态框', async ({ page }) => {
    await page.getByText('登录/注册').click();
    await expect(page.getByText('登录')).toBeVisible();
    await expect(page.getByText('用户名')).toBeVisible();
    await expect(page.getByText('密码')).toBeVisible();
  });

  test('切换到注册模式', async ({ page }) => {
    await page.getByText('登录/注册').click();
    await page.getByText('没有账号？去注册').click();
    await expect(page.getByText('注册')).toBeVisible();
    await expect(page.getByText('邮箱')).toBeVisible();
  });

  test('用户注册流程', async ({ page }) => {
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123'
    };

    await page.getByText('登录/注册').click();
    await page.getByText('没有账号？去注册').click();
    
    await page.getByPlaceholder('请输入用户名').fill(testUser.username);
    await page.getByPlaceholder('请输入邮箱').fill(testUser.email);
    await page.getByPlaceholder('请输入密码').fill(testUser.password);
    
    await page.getByRole('button', { name: '注册' }).click();
    
    // 等待注册完成
    await page.waitForTimeout(2000);
    
    // 检查是否登录成功
    await expect(page.getByText(`欢迎, ${testUser.username}`)).toBeVisible();
    await expect(page.getByText('登出')).toBeVisible();
  });

  test('用户登录流程', async ({ page }) => {
    // 使用已注册的测试用户
    const testUser = {
      username: 'testuser',
      password: 'testpass123'
    };

    await page.getByText('登录/注册').click();
    
    await page.getByPlaceholder('请输入用户名').fill(testUser.username);
    await page.getByPlaceholder('请输入密码').fill(testUser.password);
    
    await page.getByRole('button', { name: '登录' }).click();
    
    // 等待登录完成
    await page.waitForTimeout(2000);
    
    // 检查是否登录成功
    await expect(page.getByText(`欢迎, ${testUser.username}`)).toBeVisible();
    await expect(page.getByText('登出')).toBeVisible();
  });

  test('用户登出功能', async ({ page }) => {
    // 先登录
    const testUser = {
      username: 'testuser',
      password: 'testpass123'
    };

    await page.getByText('登录/注册').click();
    await page.getByPlaceholder('请输入用户名').fill(testUser.username);
    await page.getByPlaceholder('请输入密码').fill(testUser.password);
    await page.getByRole('button', { name: '登录' }).click();
    
    await page.waitForTimeout(2000);
    
    // 登出
    await page.getByText('登出').click();
    
    // 检查是否回到未登录状态
    await expect(page.getByText('登录/注册')).toBeVisible();
  });
});