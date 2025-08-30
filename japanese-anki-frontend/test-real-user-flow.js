const { chromium } = require('playwright');

const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  backendUrl: 'http://localhost:5000',
  pollingInterval: 10000, // 10秒
  maxWaitTime: 120000, // 2分钟
};

// 生成随机测试数据
const generateRandomUser = () => ({
  username: `testuser_${Math.random().toString(36).substring(2, 10)}`,
  email: `test_${Math.random().toString(36).substring(2, 10)}@example.com`,
  password: 'testpass123'
});

const testJapaneseText = `
こんにちは。私は日本語を勉強しています。
今日はとても良い天気です。
日本の文化はとても面白いです。
私は寿司が大好きです。
明日も勉強を続けます。
`;

async function runFullE2ETest() {
  console.log('🚀 开始端到端测试...');
  
  const browser = await chromium.launch({ 
    headless: false, // 设置为true可以无界面运行
    slowMo: 1000 // 慢动作便于观察
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const user = generateRandomUser();
  console.log(`📋 测试用户: ${user.username}`);
  
  try {
    // 1. 访问首页
    console.log('1️⃣ 访问首页...');
    await page.goto(TEST_CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    
    // 2. 点击登录/注册按钮
    console.log('2️⃣ 打开登录模态框...');
    await page.click('text=登录/注册');
    await page.waitForSelector('[role="dialog"]');
    
    // 3. 切换到注册标签
    console.log('3️⃣ 切换到注册...');
    await page.click('text=注册');
    
    // 4. 填写注册信息
    console.log('4️⃣ 填写注册信息...');
    await page.fill('input[placeholder="用户名"]', user.username);
    await page.fill('input[placeholder="邮箱"]', user.email);
    await page.fill('input[placeholder="密码"]', user.password);
    
    // 5. 提交注册
    console.log('5️⃣ 提交注册...');
    await page.click('button:has-text("注册")');
    
    // 等待注册完成（可能自动登录）
    await page.waitForTimeout(2000);
    
    // 6. 验证已登录（看右上角是否显示用户名）
    console.log('6️⃣ 验证登录状态...');
    await page.waitForSelector(`text=${user.username}`, { timeout: 10000 });
    
    // 7. 选择JLPT等级
    console.log('7️⃣ 选择单词书等级...');
    await page.check('input[value="N4"]');
    await page.check('input[value="N5"]');
    
    // 8. 输入日语文本
    console.log('8️⃣ 输入日语文本...');
    await page.fill('textarea', testJapaneseText);
    
    // 9. 开始制作单词卡片
    console.log('9️⃣ 创建任务...');
    await page.click('button:has-text("开始制作单词卡片")');
    
    // 10. 等待任务出现在队列中
    console.log('🔍 等待任务出现在队列中...');
    await page.waitForSelector('.task-item', { timeout: 10000 });
    
    // 11. 轮询任务状态
    console.log('⏳ 轮询任务状态...');
    let isCompleted = false;
    let attempts = 0;
    const maxAttempts = 12; // 2分钟
    
    while (!isCompleted && attempts < maxAttempts) {
      const taskStatus = await page.textContent('.task-status');
      console.log(`   第${attempts + 1}次检查，状态: ${taskStatus?.trim()}`);
      
      if (taskStatus?.includes('已完成')) {
        isCompleted = true;
        break;
      }
      
      attempts++;
      await page.waitForTimeout(TEST_CONFIG.pollingInterval);
    }
    
    if (!isCompleted) {
      throw new Error('任务超时未完成');
    }
    
    // 12. 下载文件
    console.log('📥 下载文件...');
    await page.click('button:has-text("下载")');
    
    // 等待下载完成
    await page.waitForTimeout(3000);
    
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    // 截图保存
    await page.screenshot({ path: 'test-failure.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// 运行测试
if (require.main === module) {
  runFullE2ETest()
    .then(() => console.log('🎉 所有测试通过!'))
    .catch(error => {
      console.error('💥 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { runFullE2ETest };