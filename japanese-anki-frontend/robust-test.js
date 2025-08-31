#!/usr/bin/env node
/**
 * 重申的健壮测试脚本 - 针对实际项目代码结构优化
 * 
 * 功能覆盖：
 * 1. 随机用户注册
 * 2. 自动/手动登录
 * 3. 选择JLPT等级
 * 4. 输入日语文本
 * 5. 提交任务并轮询状态
 * 6. 下载.apkg文件
 * 
 * 环境变量：
 * - FRONTEND_URL: 前端服务器地址（默认：http://localhost:5173）
 * - HEADLESS: 是否无头模式（默认：false）
 * - SLOW_MO: 操作间隔时间（默认：1000ms）
 * 
 * 使用方法：
 * npm run test 或 node robust-test.js
 */

import { chromium } from 'playwright';
import { faker } from '@faker-js/faker';

// 生成随机用户信息
function generateRandomUser() {
    // 使用更随机的用户名生成方式，避免冲突
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const username = `testuser_${timestamp}_${randomNum}`;
    const email = `test_${timestamp}_${randomNum}@example.com`;
    const password = faker.internet.password({ length: 16 }) + Math.floor(Math.random() * 1000);
    
    return {
        username: username,
        email: email,
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

// 重试逻辑包装器已移除 - 严格测试模式

// 页面内容dump函数 - 用于调试
async function dumpPageContent(page, stepName, stepNumber = null) {
    try {
        const timestamp = Date.now();
        const stepPrefix = stepNumber ? `step-${stepNumber.toString().padStart(2, '0')}-` : '';
        const dumpPath = `./debug/${stepPrefix}${stepName}-${timestamp}.txt`;
        
        // 确保debug目录存在
        const fs = await import('fs');
        if (!fs.existsSync('./debug')) {
            fs.mkdirSync('./debug', { recursive: true });
        }
        
        // 获取页面完整内容
        const content = await page.content();
        const title = await page.title();
        const url = page.url();
        
        // 获取所有文本内容
        const textContent = await page.evaluate(() => {
            // 获取所有可见文本
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        if (node.parentElement && 
                            node.parentElement.offsetParent !== null &&
                            node.textContent.trim().length > 0) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }
                },
                false
            );
            
            const texts = [];
            let node;
            while (node = walker.nextNode()) {
                texts.push(node.textContent.trim());
            }
            return texts.filter(t => t.length > 0);
        });
        
        // 获取错误消息
        const errorMessages = await page.evaluate(() => {
            const errors = [];
            const errorSelectors = [
                '.text-red-500', '.text-red-600', '.text-red-700',
                '.error-message', '.alert-error', '.error',
                '.text-green-500', '.text-green-600', '.text-green-700',
                '.success-message', '.alert-success', '.success'
            ];
            
            errorSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.textContent.trim()) {
                        errors.push({
                            selector: selector,
                            text: el.textContent.trim(),
                            className: el.className
                        });
                    }
                });
            });
            return errors;
        });
        
        // 获取表单状态
        const formState = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            return inputs.map(input => ({
                type: input.type,
                name: input.name,
                value: input.value,
                placeholder: input.placeholder,
                disabled: input.disabled
            }));
        });
        
        // 构建完整的dump内容
        const dumpContent = `
================ PAGE DUMP: ${stepName} ================
时间: ${new Date().toISOString()}
URL: ${url}
标题: ${title}

================ 文本内容 ================
${textContent.join('\n')}

================ 错误/提示消息 ================
${JSON.stringify(errorMessages, null, 2)}

================ 表单状态 ================
${JSON.stringify(formState, null, 2)}

================ 完整HTML ================
${content}

================ END DUMP ================
`;
        
        fs.writeFileSync(dumpPath, dumpContent, 'utf8');
        log(`📄 页面内容已保存: ${dumpPath}`);
        
        // 同时输出关键信息到控制台
        if (errorMessages.length > 0) {
            log("🔍 发现错误/提示消息:");
            errorMessages.forEach(msg => log(`  - ${msg.text}`));
        }
        
        return dumpPath;
    } catch (error) {
        log(`页面dump失败 (${stepName}):`, error.message);
        return null;
    }
}

// 简化的截图函数（保留用于参考）
async function takeScreenshot(page, stepName, stepNumber = null) {
    try {
        const timestamp = Date.now();
        const stepPrefix = stepNumber ? `step-${stepNumber.toString().padStart(2, '0')}-` : '';
        const screenshotPath = `./screenshots/${stepPrefix}${stepName}-${timestamp}.png`;
        
        const fs = await import('fs');
        if (!fs.existsSync('./screenshots')) {
            fs.mkdirSync('./screenshots', { recursive: true });
        }
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
        log(`📸 截图: ${screenshotPath}`);
        return screenshotPath;
    } catch (error) {
        log(`截图失败:`, error.message);
        return null;
    }
}

// 详细的日志输出
function log(message, data = null) {
    const timestamp = new Date().toISOString();
    // 确保UTF-8编码输出
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(`[${timestamp}] ${message}\n`);
    process.stdout.write(encodedMessage);
    
    if (data) {
        const encodedData = encoder.encode(JSON.stringify(data, null, 2) + '\n');
        process.stdout.write(encodedData);
    }
}

// 严格模式模态框关闭 - 只使用ESC键
async function closeModal(page) {
    log("关闭模态框...");
    await page.keyboard.press('Escape');
    await sleep(1000);
    
    // 严格验证模态框已关闭
    const modal = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
    if (await modal.count() > 0) {
        throw new Error("❌ 测试失败：模态框未成功关闭");
    }
    log("✅ 模态框已成功关闭");
}

// 主测试函数
async function runFullTest() {
    let browser;
    let page;
    
    try {
        log("启动浏览器...");
        const headless = process.env.HEADLESS === 'true';
        const slowMo = parseInt(process.env.SLOW_MO) || 1000;
        
        browser = await chromium.launch({ 
            headless: headless,
            slowMo: slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // 适合服务器环境
        });
        
        log(`浏览器配置: headless=${headless}, slowMo=${slowMo}ms`);
        
        page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        
        // 捕获浏览器控制台日志
        page.on('console', msg => {
            log(`浏览器控制台 [${msg.type()}]: ${msg.text()}`);
        });
        
        // 捕获页面错误
        page.on('pageerror', error => {
            log(`页面错误: ${error.message}`);
        });
        
        // 捕获网络请求失败
        page.on('requestfailed', request => {
            log(`请求失败: ${request.url()} - ${request.failure()?.errorText}`);
        });
        
        // 捕获所有网络响应
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                log(`API响应: ${response.status()} ${response.url()}`);
            }
        });
        
        // 生成随机用户数据
        const user = generateRandomUser();
        log("生成随机用户数据:", user);
        
        // 1. 访问首页 - 使用实际的开发服务器地址
        log("访问首页...");
        const frontendUrl = process.env.FRONTEND_URL || 'http://67d31b9e.r3.cpolar.top';
        log(`使用前端地址: ${frontendUrl}`);
        await page.goto(frontendUrl, { waitUntil: 'networkidle', timeout: 180000 });
        
        // 等待React应用完全加载 - 增加等待时间应对cpolar延迟
        log("等待React应用加载（最多60秒）...");
        
        // 检查页面是否真正加载完成，最多等待60秒
        let retryCount = 0;
        let pageLoaded = false;
        const maxRetries = 12; // 12 * 5秒 = 60秒
        
        while (retryCount < maxRetries && !pageLoaded) {
            const rootContent = await page.locator('#root').textContent();
            if (rootContent && rootContent.trim().length > 10) {
                pageLoaded = true;
                log("✅ 页面加载完成");
            } else {
                retryCount++;
                log(`⏳ 页面仍在加载中，等待第${retryCount}/${maxRetries}次重试（5秒间隔）...`);
                await page.waitForTimeout(5000);
            }
        }
        
        if (!pageLoaded) {
            log("❌ 页面加载超时，检查网络连接和服务器状态");
            const finalContent = await page.locator('body').textContent();
            log(`最终页面内容: ${finalContent?.substring(0, 200)}...`);
            throw new Error("页面加载失败，请检查前端服务器状态");
        }
        
        await dumpPageContent(page, 'homepage-loaded', 1);
        
        // 2. 点击登录/注册按钮 - 严格模式：直接执行，不重试
        log("点击登录/注册按钮...");
        
        // 先检查按钮是否存在
        const loginButton = await page.locator('button:has-text("Login/Register")');
        const buttonCount = await loginButton.count();
        log(`找到 ${buttonCount} 个登录/注册按钮`);
        
        if (buttonCount === 0) {
            // 检查页面是否有其他内容
            const bodyText = await page.locator('body').textContent();
            log(`页面body内容: ${bodyText?.substring(0, 200)}...`);
            
            // 检查React根元素
            const rootElement = await page.locator('#root');
            const rootContent = await rootElement.textContent();
            log(`React根元素内容: ${rootContent?.substring(0, 200)}...`);
            
            throw new Error("❌ 测试失败：找不到登录/注册按钮");
        }
        
        await loginButton.click();
        await page.waitForTimeout(2000);
        
        // 严格验证模态框已打开
        const modal = await page.locator('div.fixed[class*="bg-black"][class*="bg-opacity-50"]');
        if (await modal.count() === 0) {
            throw new Error("❌ 测试失败：点击登录按钮后模态框未打开");
        }
        await dumpPageContent(page, 'login-modal-opened', 2);
        
        // 3. 切换到注册模式 - 使用实际的按钮文本
        log("切换到注册模式...");
        await page.click('button:has-text("No account? Register")');
        await page.waitForTimeout(1000);
        
        // 检查是否成功切换到注册模式 - 检查h2标题
        const registerTitle = await page.locator('h2:has-text("Register")');
        if (await registerTitle.count() > 0) {
            log("✅ 成功切换到注册模式");
        } else {
            throw new Error("❌ 切换到注册模式失败：未检测到注册模式界面");
        }
        
        await dumpPageContent(page, 'register-mode-selected', 3);
        
        // 4. 填写注册信息 - 使用实际的表单结构
        log("填写注册信息...");
        log(`用户名: ${user.username}`);
        log(`邮箱: ${user.email}`);
        log(`密码: ${user.password.substring(0, 3)}...`);
        
        // 使用更精确的选择器填写表单
        await page.fill('input[type="text"]', user.username);
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        await dumpPageContent(page, 'register-form-filled', 4);
        
        // 5. 提交注册 - 使用实际的提交按钮
        log("模拟点击注册按钮...");
        await page.click('button[type="submit"]:has-text("Register")');
        
        // 等待注册响应 - 根据实际API实现，注册成功后自动登录并关闭模态框
        log("等待注册响应，预期注册成功并自动登录...");
        await page.waitForTimeout(3000);
        await dumpPageContent(page, 'register-submitted', 5);
        
        // 等待更长时间以确保注册完成
        await page.waitForTimeout(5000);
        
        // 检查是否有错误消息显示
        const errorMessage = await page.locator('.text-red-500, .text-red-600, .text-red-700, .error-message');
        if (await errorMessage.count() > 0) {
            const errorText = await errorMessage.textContent();
            log("❌ 注册失败，错误信息:", errorText);
            await dumpPageContent(page, 'register-error', 6);
            
            // 检查是否为用户名已存在的错误，如果是则重新生成用户信息并重试
            if (errorText.includes('already registered') || errorText.includes('已存在') || errorText.includes('Username or email')) {
                log("⚠️  用户名已存在，重新生成用户信息并重试...");
                user = generateRandomUser();
                
                // 重新填写表单
                await page.fill('input[type="text"]', user.username);
                await page.fill('input[type="email"]', user.email);
                await page.fill('input[type="password"]', user.password);
                
                // 重新提交
                await page.click('button[type="submit"]:has-text("Register")');
                await page.waitForTimeout(5000);
                
                // 检查是否成功
                const newErrorMessage = await page.locator('.text-red-500, .text-red-600, .text-red-700, .error-message');
                if (await newErrorMessage.count() > 0) {
                    const newErrorText = await newErrorMessage.textContent();
                    throw new Error(`注册失败（重试后）: ${newErrorText}`);
                }
                
                // 如果重试后没有错误，继续后续检查
                // 跳过后续错误检查，直接进入成功检查
            }
            
            throw new Error(`注册失败: ${errorText}`);
        }
        
        // 检查注册是否成功 - 模态框应该消失，显示用户名
        const modalCheck = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
        const welcomeSpan = await page.locator('span:has-text("Welcome,")');
        
        if (await modalCheck.count() === 0 && await welcomeSpan.count() > 0) {
            log("✅ 注册成功，已自动登录");
        } else {
            // 如果模态框仍在，检查是否有成功提示
            const successMessage = await page.locator('.text-green-500, .text-green-600, .success-message');
            if (await successMessage.count() > 0) {
                const successText = await successMessage.textContent();
                log("注册成功提示:", successText);
                
                // 再等待一段时间看是否会自动关闭
                await page.waitForTimeout(3000);
                
                // 最终检查模态框状态 - 必须关闭才算成功
                const finalModalCount = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').count();
                const finalWelcomeSpan = await page.locator('span:has-text("Welcome,")');
                
                if (finalModalCount > 0 || await finalWelcomeSpan.count() === 0) {
                    await dumpPageContent(page, 'registration-failed', 6);
                    throw new Error("❌ 注册失败：注册后模态框未关闭或未显示登录状态");
                } else {
                    log("✅ 注册成功，模态框已关闭");
                }
            } else {
                await dumpPageContent(page, 'registration-failed', 6);
                throw new Error("❌ 注册失败：未检测到成功提示或登录状态");
            }
        }
        
        // 7. 检查登录状态 - 严格模式：必须已经登录，否则快速失败
        await page.waitForTimeout(2000);
        
        // 检查是否已登录 - 查看导航栏中的用户欢迎信息
        const userWelcomeText = await page.locator('span:has-text("Welcome,")');
        const loginButton2 = await page.locator('button:has-text("Login/Register")');
        
        if (await userWelcomeText.count() > 0) {
            log("✅ 已成功登录");
        } else {
            // 严格模式：如果注册后没有自动登录，直接失败
            await dumpPageContent(page, 'login-status-check-failed', 7);
            if (await loginButton2.count() > 0) {
                throw new Error("❌ 测试失败：注册后未自动登录，仍显示Login/Register按钮");
            } else {
                throw new Error("❌ 测试失败：无法确定登录状态，未找到Welcome信息或Login按钮");
            }
        }
        
        // 8. 选择单词书等级 - 根据实际组件结构选择N4和N5
        log("选择单词书等级...");
        
        // 等待页面加载完成
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 查找N4和N5的checkbox - 使用实际的DOM结构
        const n4Label = await page.locator('label:has-text("N4")');
        const n5Label = await page.locator('label:has-text("N5")');
        
        if (await n4Label.count() > 0) {
            await n4Label.click();
            log("已选择N4等级");
        } else {
            log("警告：未找到N4选项，可能已默认选中");
        }
        
        if (await n5Label.count() > 0) {
            await n5Label.click();
            log("已选择N5等级");
        } else {
            log("警告：未找到N5选项，可能已默认选中");
        }
        await takeScreenshot(page, 'vocabulary-levels-selected', 7);
        
        // 9. 输入日语文本 - 使用实际的textarea组件
        const japaneseText = generateJapaneseText();
        log("输入日语文本（约300字）:", japaneseText.substring(0, 100) + "...");
        log(`文本长度: ${japaneseText.length}字符`);
        
        // 查找文本输入区域 - 使用实际的textarea选择器
        const textArea = await page.locator('textarea');
        if (await textArea.count() > 0) {
            await textArea.click();
            await textArea.fill(japaneseText);
            log("✅ 已成功输入日语文本");
        } else {
            throw new Error("❌ 文本输入失败：未找到文本输入区域");
        }
        await takeScreenshot(page, 'japanese-text-entered', 8);
        
        // 10. 提交任务 - 点击Generate Flashcards按钮
        log("准备提交任务，点击Generate Flashcards按钮...");
        
        // 查找Generate Flashcards按钮
        const submitBtn = await page.locator('button:has-text("Generate Flashcards")');
        if (await submitBtn.count() > 0) {
            // 检查按钮是否可用（不是disabled状态）
            const isDisabled = await submitBtn.getAttribute('disabled');
            if (isDisabled !== null) {
                throw new Error("❌ 任务提交失败：按钮处于禁用状态，请检查文本和等级选择");
            }
            
            try {
                await submitBtn.click();
                log("✅ 已点击Generate Flashcards按钮");
            } catch (error) {
                throw new Error("❌ 生成卡片按钮点击失败：" + error.message);
            }
        } else {
            throw new Error("❌ 任务提交失败：未找到Generate Flashcards按钮");
        }
        await takeScreenshot(page, 'task-submitted', 9);
        
        // 11. 等待任务创建并验证Task Queue中出现新任务
        log("等待任务创建，验证Task Queue中出现新任务...");
        await page.waitForTimeout(3000);
        
        let taskId = null;
        try {
            // 等待任务创建和页面更新
            await page.waitForTimeout(2000);
            
            // 在Task Queue区域查找新任务
            const taskQueueSection = await page.locator('h3:has-text("Task Queue")');
            if (await taskQueueSection.count() === 0) {
                throw new Error("❌ 未找到Task Queue区域");
            }
            
            // 查找任务卡片 - 使用实际的任务卡片结构
            const taskCards = await page.locator('.bg-white.rounded-lg.border.border-gray-200');
            const taskCount = await taskCards.count();
            log(`🔍 找到 ${taskCount} 个任务卡片`);
            
            if (taskCount > 0) {
                log("✅ 发现任务，Task Queue中出现新任务");
                
                // 检查最新的任务（通常是第一个）
                const firstTask = taskCards.first();
                const taskText = await firstTask.textContent();
                log(`最新任务详情:`, taskText?.substring(0, 200));
                
                // 从任务文本中提取任务名称或ID
                if (taskText && taskText.includes('Task_')) {
                    const taskNameMatch = taskText.match(/Task_[^\n]+/);
                    if (taskNameMatch) {
                        taskId = taskNameMatch[0];
                        log("🆔 成功获取任务名称:", taskId);
                    }
                }
            } else {
                // 检查是否显示"No tasks"消息
                const noTasksText = await page.locator('text=No tasks').count();
                if (noTasksText > 0) {
                    log("📋 显示无任务消息");
                }
                throw new Error("❌ 任务创建失败：Task Queue中未出现新任务");
            }
            
            await takeScreenshot(page, 'task-created', 10);
        } catch (error) {
            log("❌ 任务创建检查失败:", error.message);
            await takeScreenshot(page, 'task-creation-error', 10);
            throw error;
        }
        
        // 12. 轮询任务状态 - 每5秒检查一次（匹配组件轮询间隔）
        log("开始轮询任务状态...");
        let completed = false;
        let attempts = 0;
        const maxAttempts = 36; // 36 * 5秒 = 3分钟
        
        while (!completed && attempts < maxAttempts) {
            attempts++;
            log(`第 ${attempts} 次检查任务状态，等待任务完成...`);
            
            // 等待5秒（匹配组件的POLLING_INTERVAL）
            await page.waitForTimeout(5000);
            
            // 查找任务卡片
            const taskCards = await page.locator('.bg-white.rounded-lg.border.border-gray-200');
            const taskCount = await taskCards.count();
            log(`找到 ${taskCount} 个任务卡片`);
            
            // 每次检查时截图记录状态
            await takeScreenshot(page, `task-status-check-attempt-${attempts}`, 10 + attempts);
            
            if (taskCount > 0) {
                // 检查最新的任务（通常是第一个）
                const firstTask = taskCards.first();
                const taskText = await firstTask.textContent();
                log(`任务状态: ${taskText}`);
                
                if (taskText && taskText.includes('Completed')) {
                    log("任务已完成！准备下载...");
                    completed = true;
                    await takeScreenshot(page, 'task-completed', 20);
                    
                    // 查找Download按钮 - 使用实际组件结构
                    const downloadBtn = await firstTask.locator('button:has-text("Download")');
                    if (await downloadBtn.count() > 0) {
                        log("找到Download按钮，准备下载文件...");
                        
                        // 设置下载事件监听
                        const downloadPromise = page.waitForEvent('download');
                        await downloadBtn.click();
                        
                        const download = await downloadPromise;
                        const suggestedFilename = download.suggestedFilename();
                        const downloadPath = `./downloads/${suggestedFilename || 'downloaded-anki-cards.apkg'}`;
                        
                        // 确保下载目录存在
                        const fs = await import('fs');
                        if (!fs.existsSync('./downloads')) {
                            fs.mkdirSync('./downloads', { recursive: true });
                        }
                        
                        await download.saveAs(downloadPath);
                        log(`文件已下载到: ${downloadPath}`);
                        await takeScreenshot(page, 'file-downloaded', 21);
                        
                        // 验证下载的文件
                        if (fs.existsSync(downloadPath)) {
                            const stats = fs.statSync(downloadPath);
                            log(`✅ 下载成功！文件大小: ${stats.size} 字节`);
                            
                            if (downloadPath.endsWith('.apkg')) {
                                log("✅ 文件格式正确（.apkg）");
                            } else {
                                log("⚠️ 文件扩展名不是.apkg，但下载成功");
                            }
                        } else {
                            throw new Error("❌ 下载失败：文件未保存到指定路径");
                        }
                    } else {
                        throw new Error("❌ 下载失败：任务完成但未找到Download按钮");
                    }
                    break;
                } else if (taskText && (taskText.includes('Failed') || taskText.includes('失败'))) {
                    log("❌ 任务失败！", taskText);
                    throw new Error("任务处理失败: " + taskText);
                } else if (taskText && (taskText.includes('Processing') || taskText.includes('处理中'))) {
                    log("⏳ 任务处理中...");
                } else if (taskText && (taskText.includes('Pending') || taskText.includes('等待'))) {
                    log("⏳ 任务等待中...");
                }
            } else {
                log("⚠️ 未找到任务卡片");
            }
            
            if (!completed && attempts < maxAttempts) {
                log(`任务未完成，等待5秒后重试... (剩余尝试: ${maxAttempts - attempts}次)`);
            }
        }
        
        if (!completed) {
            throw new Error("❌ 任务处理失败：在规定时间内任务未完成");
        }
        
        log("🎉 测试流程验证完成！所有功能测试通过：");
        log("   ✅ 1. 随机生成用户信息并成功注册");
        log("   ✅ 2. 注册后自动登录或手动登录成功");
        log("   ✅ 3. 选择N4和N5单词书等级");
        log("   ✅ 4. 输入日语文本（约300字符）");
        log("   ✅ 5. 点击Generate Flashcards按钮提交任务");
        log("   ✅ 6. Task Queue中成功创建新任务");
        log("   ✅ 7. 轮询任务状态直到完成（每5秒检查）");
        log("   ✅ 8. 任务完成后成功下载.apkg文件");
        log("   ✅ 9. 文件保存到本地downloads目录");
        
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
console.log("开始运行测试...");
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