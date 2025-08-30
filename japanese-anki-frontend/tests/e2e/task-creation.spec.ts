import { test, expect } from '@playwright/test';

test.describe('任务创建功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 先登录
    await page.getByText('登录/注册').click();
    await page.getByPlaceholder('请输入用户名').fill('testuser');
    await page.getByPlaceholder('请输入密码').fill('testpass123');
    await page.getByRole('button', { name: '登录' }).click();
    
    await page.waitForTimeout(2000);
  });

  test('显示文本输入区域', async ({ page }) => {
    await expect(page.getByText('输入日语文本')).toBeVisible();
    await expect(page.getByPlaceholder('在这里输入或粘贴日语文本...')).toBeVisible();
  });

  test('显示单词书选择', async ({ page }) => {
    await expect(page.getByText('选择单词书')).toBeVisible();
    await expect(page.getByText('N1')).toBeVisible();
    await expect(page.getByText('N2')).toBeVisible();
    await expect(page.getByText('N3')).toBeVisible();
    await expect(page.getByText('N4')).toBeVisible();
    await expect(page.getByText('N5')).toBeVisible();
  });

  test('选择单词书', async ({ page }) => {
    // 取消默认选择
    await page.getByLabel('N4').uncheck();
    await page.getByLabel('N5').uncheck();
    
    // 选择N1和N2
    await page.getByLabel('N1').check();
    await page.getByLabel('N2').check();
    
    // 验证选择
    await expect(page.getByLabel('N1')).toBeChecked();
    await expect(page.getByLabel('N2')).toBeChecked();
    await expect(page.getByLabel('N4')).not.toBeChecked();
  });

  test('输入日语文本', async ({ page }) => {
    const testText = '今日はとても良い天気ですね。外に出かけたくなります。';
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill(testText);
    
    await expect(page.getByPlaceholder('在这里输入或粘贴日语文本...')).toHaveValue(testText);
  });

  test('未登录用户点击创建任务显示登录提示', async ({ page }) => {
    // 登出
    await page.getByText('登出').click();
    await page.waitForTimeout(1000);
    
    // 填写内容
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试文本');
    
    // 点击创建任务
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 应该显示登录模态框
    await expect(page.getByText('登录')).toBeVisible();
  });

  test('未选择单词书时禁用创建按钮', async ({ page }) => {
    // 取消所有选择
    await page.getByLabel('N4').uncheck();
    await page.getByLabel('N5').uncheck();
    
    // 填写文本
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试文本');
    
    // 创建按钮应该被禁用
    await expect(page.getByRole('button', { name: '开始制作单词卡片' })).toBeDisabled();
  });

  test('创建任务流程', async ({ page }) => {
    const testText = '今日はとても良い天気ですね。外に出かけたくなります。でも、明日は雨が降るかもしれません。';
    
    // 选择N4和N5
    await page.getByLabel('N1').uncheck();
    await page.getByLabel('N2').uncheck();
    await page.getByLabel('N3').uncheck();
    await page.getByLabel('N4').check();
    await page.getByLabel('N5').check();
    
    // 输入文本
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill(testText);
    
    // 创建任务
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 等待任务创建
    await page.waitForTimeout(2000);
    
    // 检查文本区域是否清空
    await expect(page.getByPlaceholder('在这里输入或粘贴日语文本...')).toHaveValue('');
    
    // 检查任务是否在队列中
    await expect(page.getByText('任务队列')).toBeVisible();
    await expect(page.getByText('等待处理')).toBeVisible();
  });
});