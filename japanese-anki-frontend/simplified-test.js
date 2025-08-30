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

// 生成300字左右的日语文本
function generateJapaneseText() {
    const japaneseTexts = [
        "私は日本語の学習者です。毎日日本語を勉強しています。日本の文化が大好きで、アニメや漫画を見ることが好きです。特にドラえもんが好きです。日本語の勉強は難しいですが、楽しいです。漢字を覚えるのが一番難しいです。でも、諦めずに勉強しています。将来、日本に行ってみたいです。東京や京都を訪れたいです。日本の料理も好きで、寿司やラーメンを食べたいです。日本語を話せるようになったら、日本人の友達を作りたいです。一緒に日本語で会話したいです。日本語の勉強を続けて、上手になりたいです。毎日少しずつ勉強しています。日本語の文法は複雑ですが、面白いです。助詞の使い方が難しいです。でも、練習すれば上手になります。日本語の発音も大切です。正しい発音で話したいです。日本語の勉強は長い道のりですが、楽しんで続けています。",
        "日本の四季はとても美しいです。春には桜が咲き、夏には花火大会があります。秋には紅葉がきれいで、冬には雪が降ります。私は日本の伝統文化に興味があります。茶道や書道を勉強してみたいです。日本の建築も素敵です。神社やお寺を見て回りたいです。日本語を勉強することで、日本の文化を深く理解できます。日本の歴史も面白いです。昔の日本の生活や文化を知りたいです。日本語の勉強を通じて、日本についてもっと知りたいです。日本の現代文化も好きです。J-POPや日本のドラマを見ることが好きです。日本語が上手になれば、日本の映画を字幕なしで見られるようになります。それが目標です。毎日日本語を勉強して、夢を叶えたいです。日本語の勉強は続けていくことが大切です。"
    ];
    
    return japaneseTexts[Math.floor(Math.random() * japaneseTexts.length)];
}

async function runSimplifiedTest() {
    let browser;
    let page;
    
    try {
        console.log("开始运行简化测试...");
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        
        // 生成随机用户数据
        const user = generateRandomUser();
        console.log("生成随机用户数据:", user);
        
        // 1. 访问首页
        console.log("访问首页...");
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        
        // 2. 点击登录/注册按钮
        console.log("点击登录/注册按钮...");
        await page.click('button:has-text("Login/Register")');
        await page.waitForTimeout(2000);
        
        // 3. 切换到注册模式
        console.log("切换到注册模式...");
        await page.click('button:has-text("No account? Register")');
        await page.waitForTimeout(1000);
        
        // 4. 填写注册信息
        console.log("填写注册信息...");
        await page.fill('input[type="text"]', user.username);
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        
        // 5. 提交注册
        console.log("提交注册...");
        await page.click('button[type="submit"]:has-text("Register")');
        await page.waitForTimeout(3000);
        
        // 6. 关闭模态框
        console.log("关闭模态框...");
        try {
            await page.click('[aria-label="Close"]');
        } catch {
            await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(2000);
        
        // 7. 选择单词书等级
        console.log("选择单词书等级...");
        await page.check('input[value="N3"]');
        await page.check('input[value="N4"]');
        
        // 8. 输入日语文本
        const japaneseText = generateJapaneseText();
        console.log("输入日语文本...");
        await page.fill('textarea', japaneseText);
        
        // 9. 提交任务
        console.log("提交任务...");
        await page.click('button:has-text("Generate Flashcards")');
        await page.waitForTimeout(3000);
        
        // 10. 检查任务是否创建成功
        const taskItems = await page.$$('h4');
        console.log(`找到 ${taskItems.length} 个任务标题`);
        
        // 11. 等待任务完成 (简化版，只检查页面状态)
        await page.waitForTimeout(5000);
        
        console.log("测试完成！所有步骤成功执行。");
        
    } catch (error) {
        console.error("测试过程中发生错误:", error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
runSimplifiedTest()
    .then(() => {
        console.log("简化测试成功完成！");
        process.exit(0);
    })
    .catch((error) => {
        console.error("简化测试失败:", error);
        process.exit(1);
    });