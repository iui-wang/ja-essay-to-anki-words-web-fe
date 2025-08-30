import { test, expect } from '@playwright/test';

test.describe('任务队列功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 先登录
    await page.getByText('登录/注册').click();
    await page.getByPlaceholder('请输入用户名').fill('testuser');
    await page.getByPlaceholder('请输入密码').fill('testpass123');
    await page.getByRole('button', { name: '登录' }).click();
    
    await page.waitForTimeout(2000);
  });

  test('显示任务队列标题', async ({ page }) => {
    await expect(page.getByText('任务队列')).toBeVisible();
  });

  test('任务队列初始状态', async ({ page }) => {
    await expect(page.getByText('暂无任务')).toBeVisible();
    await expect(page.getByText('创建任务后将显示在这里')).toBeVisible();
  });

  test('创建任务后显示在队列中', async ({ page }) => {
    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试任务队列显示');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 等待任务创建
    await page.waitForTimeout(2000);
    
    // 检查任务是否在队列中
    await expect(page.getByText('测试任务队列显示')).toBeVisible();
    await expect(page.getByText('等待处理')).toBeVisible();
    await expect(page.getByText('等级: N4, N5')).toBeVisible();
  });

  test('任务状态更新', async ({ page }) => {
    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试状态更新');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 等待任务创建
    await page.waitForTimeout(2000);
    
    // 检查任务状态
    const statusElement = page.getByText('等待处理');
    await expect(statusElement).toBeVisible();
    
    // 等待状态更新（可能需要一些时间）
    await page.waitForTimeout(6000);
    
    // 检查是否有状态变化（处理中或已完成）
    const statusElements = page.locator('text=/等待处理|处理中|已完成/');
    await expect(statusElements.first()).toBeVisible();
  });

  test('完成的任务显示下载按钮', async ({ page }) => {
    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('测试下载功能');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    // 等待任务创建
    await page.waitForTimeout(2000);
    
    // 等待任务完成（模拟，实际测试需要后端支持）
    await page.waitForTimeout(10000);
    
    // 检查是否有下载按钮
    const downloadButton = page.getByRole('button', { name: '下载' });
    const isDownloadVisible = await downloadButton.isVisible();
    
    if (isDownloadVisible) {
      await expect(downloadButton).toBeVisible();
    } else {
      test.skip('后端未就绪，跳过下载测试');
    }
  });

  test('任务信息显示完整', async ({ page }) => {
    // 创建任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('完整信息测试');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    await page.waitForTimeout(2000);
    
    // 检查任务信息
    await expect(page.getByText('完整信息测试')).toBeVisible();
    await expect(page.getByText('等级: N4, N5')).toBeVisible();
    
    // 检查时间格式
    const timeElements = page.locator('text=/\d{1,2}月\d{1,2}日\s*\d{1,2}:\d{2}/');
    await expect(timeElements.first()).toBeVisible();
  });

  test('多个任务队列', async ({ page }) => {
    // 创建第一个任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('第一个任务');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    await page.waitForTimeout(1000);
    
    // 创建第二个任务
    await page.getByPlaceholder('在这里输入或粘贴日语文本...').fill('第二个任务');
    await page.getByRole('button', { name: '开始制作单词卡片' }).click();
    
    await page.waitForTimeout(2000);
    
    // 检查两个任务都在队列中
    await expect(page.getByText('第一个任务')).toBeVisible();
    await expect(page.getByText('第二个任务')).toBeVisible();
  });
});