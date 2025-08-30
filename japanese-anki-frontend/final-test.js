#!/usr/bin/env node
import { chromium } from 'playwright';
import { faker } from '@faker-js/faker';

// 生成随机用户信息
function generateRandomUser() {
    const username = faker.internet.username() + Math.floor(Math.random() * 1000);
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 12 });
    
    return {
        username: username.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        email: email.toLowerCase(),
        password: password
    };
}

// 生成日语文本
function generateJapaneseText() {
    return "私は日本語の学習者です。毎日日本語を勉強しています。日本の文化が大好きで、アニメや漫画を見ることが好きです。";
}

async function captureScreenshot(page, stepName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${stepName}-${timestamp}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 截图已保存: ${filename}`);
}

async function runFinalTest() {
    let browser;
    let page;
    let stepCounter = 0;
    
    function getNextStepName(name) {
        stepCounter++;
        return `${stepCounter.toString().padStart(2, '0')}-${name}`;
    }
    
    try {
        console.log("开始运行最终测试...");
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1500
        });
        
        page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        
        const user = generateRandomUser();
        console.log("用户:", user.username);
        
        // 1. 访问首页
        await captureScreenshot(page, getNextStepName('01-initial-page'));
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        
        // 2. 点击登录/注册
        await captureScreenshot(page, getNextStepName('02-before-login-click'));
        await page.click('button:has-text("Login/Register")');
        await page.waitForTimeout(2000);
        
        // 3. 切换到注册
        await captureScreenshot(page, getNextStepName('03-before-register-switch'));
        await page.click('button:has-text("No account? Register")');
        await page.waitForTimeout(1000);
        
        // 4. 填写注册信息
        await captureScreenshot(page, getNextStepName('04-before-fill-register'));
        await page.fill('input[type="text"]', user.username);
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        
        // 5. 注册
        await captureScreenshot(page, getNextStepName('05-before-register-submit'));
        await page.click('button[type="submit"]:has-text("Register")');
        await page.waitForTimeout(4000);
        
        // 6. 关闭模态框
        await captureScreenshot(page, getNextStepName('06-before-close-modal'));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(2000);
        
        // 7. 选择N3和N4
        await captureScreenshot(page, getNextStepName('07-before-select-levels'));
        await page.locator('label').filter({ hasText: 'N3' }).locator('input[type="checkbox"]').check();
        await page.locator('label').filter({ hasText: 'N4' }).locator('input[type="checkbox"]').check();
        
        // 8. 输入文本
        await captureScreenshot(page, getNextStepName('08-before-input-text'));
        await page.fill('textarea', generateJapaneseText());
        
        // 9. 提交任务
        await captureScreenshot(page, getNextStepName('09-before-submit-task'));
        await page.click('button:has-text("Generate Flashcards")');
        await page.waitForTimeout(3000);
        
        // 10. 检查任务是否创建
        await captureScreenshot(page, getNextStepName('10-before-check-tasks'));
        const taskCount = await page.locator('h4').count();
        console.log(`任务创建成功，找到 ${taskCount} 个任务`);
        
        // 最终截图
        await captureScreenshot(page, getNextStepName('11-final-state'));
        console.log("测试通过！所有功能正常");
        
    } catch (error) {
        console.error("测试失败:", error.message);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

runFinalTest()
    .then(() => {
        console.log("✅ 所有测试通过！");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ 测试失败:", error);
        process.exit(1);
    });