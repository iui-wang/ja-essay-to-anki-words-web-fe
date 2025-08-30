#!/usr/bin/env node
import { chromium } from 'playwright';

async function debugPage() {
    let browser;
    let page;
    
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        
        console.log("访问首页...");
        await page.goto('http://localhost:5174');
        await page.waitForLoadState('networkidle');
        
        // 等待并截图
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'debug-page.png', fullPage: true });
        
        // 打印页面内容
        const content = await page.content();
        console.log("页面内容:", content.substring(0, 1000));
        
        // 查找所有按钮
        const buttons = await page.locator('button').allTextContents();
        console.log("找到的按钮:", buttons);
        
        // 查找包含中文的按钮
        const chineseButtons = await page.locator('button:has-text("登录"), button:has-text("注册"), button:has-text("开始")').allTextContents();
        console.log("中文按钮:", chineseButtons);
        
        console.log("截图已保存为 debug-page.png");
        
    } catch (error) {
        console.error("错误:", error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

debugPage();