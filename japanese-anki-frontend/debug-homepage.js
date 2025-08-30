import { chromium } from 'playwright-core';

async function debugHomepage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('访问首页...');
    await page.goto('http://179412be.r3.cpolar.top');
    await page.waitForTimeout(5000);
    
    console.log('保存页面截图...');
    await page.screenshot({ path: './debug-homepage.png', fullPage: true });
    
    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 查找所有按钮
    const buttons = await page.$$('button, [role="button"]');
    console.log(`找到 ${buttons.length} 个按钮:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const className = await buttons[i].getAttribute('class');
      console.log(`按钮 ${i+1}: text="${text?.trim()}" type="${type}" class="${className}"`);
    }
    
    // 查找所有链接
    const links = await page.$$('a');
    console.log(`找到 ${links.length} 个链接:`);
    for (let i = 0; i < links.length; i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      console.log(`链接 ${i+1}: text="${text?.trim()}" href="${href}"`);
    }
    
    // 获取页面文本内容
    const bodyText = await page.textContent('body');
    console.log('页面文本内容:', bodyText?.substring(0, 500));
    
    // 检查是否有登录相关元素
    const loginElements = await page.$$('[class*="login"], [class*="Login"], [id*="login"], [id*="Login"]');
    console.log(`找到 ${loginElements.length} 个登录相关元素`);
    
    // 查找导航栏
    const navElements = await page.$$('nav, [class*="nav"], [class*="Nav"]');
    console.log(`找到 ${navElements.length} 个导航元素`);
    
  } catch (error) {
    console.error('调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugHomepage();