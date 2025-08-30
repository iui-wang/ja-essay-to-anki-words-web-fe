import { test, expect } from '@playwright/test';

test.describe('集成测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 登录
    await page.getByText('登录/注册').click();
    await page.getByPlaceholder('请输入用户名').fill('testuser');
    await page.getByPlaceholder('请输入密码').fill('testpass123');
    await page.getByRole('button', { name: '登录' }).click();
    
    await page.waitForTimeout(2000);
  });

  test('完整用户流程', async ({ page }) => {
    // 1. 登录验证
    await expect(page.getByText('欢迎, testuser')).toBeVisible();

    // 2. 输入文本和选择单词书
    const testText = '今日はとても良い天気ですね。これはテスト用の日本語文章です。';
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill(testText);
    
    // 选择N3和N4
    await page.getByLabel('N1').uncheck();
    await page.getByLabel('N2').uncheck();
    await page.getByLabel('N5').uncheck();
    await page.getByLabel('N3').check();
    await page.getByLabel('N4').check();

    // 3. 创建任务
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 等待任务创建
    await page.waitForTimeout(2000);

    // 4. 验证任务创建成功
    await expect(page.getByPlaceholder('在这里输入或粘贴日语文本...')).toHaveValue('');
    await expect(page.getByText('これはテスト用の日本語文章です')).toBeVisible();
    await expect(page.getByText('等级: N3, N4')).toBeVisible();

    // 5. 验证任务状态
    const statusElement = page.getByText(/等待处理|处理中|已完成/);
    await expect(statusElement.first()).toBeVisible();
  });

  test('多个任务创建和管理', async ({ page }) => {
    const tasks = [
      '第一篇文章：今日はとても良い天気です。',
      '第二篇文章：明日は雨が降るかもしれません。',
      '第三篇文章：昨日は友達と映画を見ました。'
    ];

    // 创建多个任务
    for (const taskText of tasks) {
      await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill(taskText);
      await page.getByRole('button', { name: '开始制作单词卡片' }).click();
      await page.waitForTimeout(1000);
    }

    // 等待所有任务加载
    await page.waitForTimeout(2000);

    // 验证所有任务都在队列中
    for (const taskText of tasks) {
      await expect(page.getByText(taskText.substring(0, 20))).toBeVisible();
    }

    // 验证任务数量
    const taskCards = page.locator('.card').locator('text=/等级: N4, N5/');
    await expect(taskCards).toHaveCount(3);
  });

  test('错误处理和验证', async ({ page }) => {
    // 测试1: 空文本提交
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 应该显示提示
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('请输入日语文本');
      await dialog.accept();
    });

    // 测试2: 未选择单词书
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试文本');
    await page.getByLabel('N4').uncheck();
    await page.getByLabel('N5').uncheck();
    
    // 创建按钮应该被禁用
    await expect(page.getByRole('button', { name: '开始制作单词卡片' })).toBeDisabled();
  });

  test('任务状态轮询', async ({ page }) => {
    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试轮询功能');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    await page.waitForTimeout(2000);

    // 获取初始状态
    const initialStatus = await page.getByText(/等待处理|处理中|已完成/).first().textContent();
    
    // 等待轮询更新
    await page.waitForTimeout(6000);
    
    // 检查状态是否更新（可能需要后端支持）
    const currentStatus = await page.getByText(/等待处理|处理中|已完成/).first().textContent();
    
    // 状态应该保持不变或更新
    expect(['等待处理', '处理中', '已完成']).toContain(currentStatus);
  });

  test('登录状态持久化', async ({ page, context }) => {
    // 验证已登录
    await expect(page.getByText('欢迎, testuser')).toBeVisible();

    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('持久化测试');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    await page.waitForTimeout(2000);

    // 刷新页面
    await page.reload();
    await page.waitForTimeout(1000);

    // 验证仍然登录
    await expect(page.getByText('欢迎, testuser')).toBeVisible();
    
    // 验证任务队列仍然存在
    await expect(page.getByText('持久化测试')).toBeVisible();
  });

  test('登出后清除状态', async ({ page }) => {
    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('登出测试');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    await page.waitForTimeout(2000);

    // 登出
    await page.getByText('登出').click();
    await page.waitForTimeout(1000);

    // 验证回到未登录状态
    await expect(page.getByText('登录/注册')).toBeVisible();
    
    // 验证需要重新登录才能创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('新任务');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 应该显示登录模态框
    await expect(page.getByText('登录')).toBeVisible();
  });
});