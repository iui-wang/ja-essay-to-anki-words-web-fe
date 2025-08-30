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

// 等待函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 详细的日志输出
function log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// 主测试函数
async function runFullTest() {
    let browser;
    let page;
    
    try {
        log("启动浏览器...");
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        
        // 生成随机用户数据
        const user = generateRandomUser();
        log("生成随机用户数据:", user);
        
        // 1. 访问首页
        log("访问首页...");
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        
        // 2. 点击登录/注册按钮
        log("点击登录/注册按钮...");
        await page.click('button:has-text("登录/注册")');
        await page.waitForTimeout(2000);
        
        // 3. 切换到注册模式
        log("切换到注册模式...");
        await page.click('button:has-text("没有账号？去注册")');
        await page.waitForTimeout(1000);
        
        // 4. 填写注册信息
        log("填写注册信息...");
        await page.fill('input[type="text"]', user.username);
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        
        // 5. 提交注册
        log("提交注册...");
        await page.click('button[type="submit"]:has-text("注册")');
        
        // 等待注册响应
        await page.waitForTimeout(3000);
        
        // 检查是否注册成功（通过检查是否有关闭按钮或页面变化）
        try {
            // 等待注册完成，页面可能会自动关闭模态框
            await page.waitForSelector('.fixed.inset-0.bg-black', { state: 'detached', timeout: 10000 });
            log("注册完成，模态框已关闭");
        } catch (error) {
            log("注册响应等待，手动关闭模态框...");
            // 尝试关闭模态框
            const closeBtn = await page.locator('button:has-text("✕"), [aria-label="Close"]');
            if (await closeBtn.count() > 0) {
                await closeBtn.click();
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForSelector('.fixed.inset-0.bg-black', { state: 'detached', timeout: 5000 });
        }
        
        // 6. 登录（如果注册后未自动登录）
        log("检查是否需要登录...");
        
        // 等待一下确保注册完成
        await page.waitForTimeout(2000);
        
        // 尝试重新打开登录
        const loginButton = await page.locator('button:has-text("登录/注册")');
        if (await loginButton.count() > 0) {
            log("需要手动登录...");
            await loginButton.click();
            await page.waitForTimeout(2000);
            
            // 确保在登录模式
            const loginModeBtn = await page.locator('button:has-text("已有账号？去登录")');
            if (await loginModeBtn.count() > 0) {
                await loginModeBtn.click();
                await page.waitForTimeout(1000);
            }
            
            // 填写登录信息
            await page.fill('input[type="text"]', user.username);
            await page.fill('input[type="password"]', user.password);
            await page.click('button[type="submit"]:has-text("登录")');
            
            await page.waitForTimeout(3000);
        } else {
            log("看起来已经登录成功");
        }
        
        // 7. 选择单词书等级
        log("选择单词书等级...");
        
        // 选择N3和N4
        const n3Checkbox = await page.locator('input[value="N3"]');
        const n4Checkbox = await page.locator('input[value="N4"]');
        
        if (await n3Checkbox.count() > 0) {
            await n3Checkbox.check();
            log("已选择N3等级");
        }
        
        if (await n4Checkbox.count() > 0) {
            await n4Checkbox.check();
            log("已选择N4等级");
        }
        
        // 8. 输入日语文本
        const japaneseText = generateJapaneseText();
        log("输入日语文本:", japaneseText.substring(0, 100) + "...");
        
        const textArea = await page.locator('textarea');
        if (await textArea.count() > 0) {
            await textArea.fill(japaneseText);
        } else {
            log("警告：未找到文本输入区域");
        }
        
        // 9. 提交任务
        log("提交任务...");
        const submitTaskBtn = await page.locator('button:has-text("生成卡片"), button:has-text("提交")');
        if (await submitTaskBtn.count() > 0) {
            await submitTaskBtn.first().click();
            log("已点击生成卡片按钮");
        } else {
            log("警告：未找到生成卡片按钮");
        }
        
        // 10. 等待任务创建并获取任务ID
        let taskId = null;
        try {
            await page.waitForSelector('.task-item, .task-card', { timeout: 10000 });
            log("任务已出现在队列中");
            
            // 获取最新任务ID
            const taskElements = await page.$$('.task-item, .task-card');
            if (taskElements.length > 0) {
                const firstTask = taskElements[0];
                const taskText = await firstTask.textContent();
                log("任务信息:", taskText);
                
                // 尝试从文本中提取任务ID
                const idMatch = taskText?.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
                if (idMatch) {
                    taskId = idMatch[0];
                    log("获取任务ID:", taskId);
                }
            }
        } catch (error) {
            log("等待任务创建超时，检查页面状态...");
        }
        
        // 11. 轮询任务状态
        log("开始轮询任务状态...");
        let completed = false;
        let attempts = 0;
        const maxAttempts = 6; // 6 * 10秒 = 1分钟
        
        while (!completed && attempts < maxAttempts) {
            attempts++;
            log(`第 ${attempts} 次检查任务状态...`);
            
            // 重新加载页面获取最新状态
            await page.reload();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            
            // 查找任务状态
            const taskElements = await page.$$('.task-item, .task-card');
            log(`找到 ${taskElements.length} 个任务`);
            
            for (let taskElement of taskElements) {
                const taskText = await taskElement.textContent();
                
                if (taskText && taskText.includes('已完成')) {
                    log("任务已完成！");
                    completed = true;
                    
                    // 查找下载按钮
                    const downloadBtn = await taskElement.$('button:has-text("下载")');
                    if (downloadBtn) {
                        log("找到下载按钮，准备下载文件...");
                        
                        // 设置下载行为
                        const downloadPromise = page.waitForEvent('download');
                        await downloadBtn.click();
                        
                        const download = await downloadPromise;
                        const downloadPath = `./downloads/downloaded-${Date.now()}.apkg`;
                        
                        await download.saveAs(downloadPath);
                        log(`文件已下载到: ${downloadPath}`);
                        
                        // 检查文件
                        const fs = await import('fs');
                        if (fs.existsSync(downloadPath)) {
                            const stats = fs.statSync(downloadPath);
                            log(`下载成功！文件大小: ${stats.size} 字节`);
                        }
                    } else {
                        log("警告：任务完成但未找到下载按钮");
                    }
                    break;
                } else if (taskText && taskText.includes('失败')) {
                    log("任务失败！", taskText);
                    throw new Error("任务处理失败: " + taskText);
                }
            }
            
            if (!completed && attempts < maxAttempts) {
                log("任务未完成，等待10秒后重试...");
                await sleep(10000);
            }
        }
        
        if (!completed) {
            throw new Error("任务超时未完成，等待时间超过1分钟");
        }
        
        log("测试完成！所有步骤成功执行。");
        
    } catch (error) {
        log("测试过程中发生错误:", error.message);
        console.error(error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
console.log("开始运行精确测试...");
runFullTest()
    .then(() => {
        console.log("测试成功完成！");
        process.exit(0);
    })
    .catch((error) => {
        console.error("测试失败:", error);
        process.exit(1);
    });

export { runFullTest };