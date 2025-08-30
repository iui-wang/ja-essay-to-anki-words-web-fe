#!/usr/bin/env node
import { chromium } from 'playwright';

async function debugCurrentPage() {
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
        
        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        
        // Wait for the page to fully load
        await page.waitForTimeout(3000);
        
        console.log('Page title:', await page.title());
        console.log('URL:', page.url());
        
        // Take a screenshot
        await page.screenshot({ path: 'debug-current.png' });
        
        // Find all buttons with their text
        const buttons = await page.$$('button');
        console.log(`Found ${buttons.length} buttons:`);
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            const className = await buttons[i].getAttribute('class');
            console.log(`Button ${i}: "${text.trim()}" - class: ${className}`);
        }
        
        // Find specific login/register button
        const loginButtons = await page.$$('button');
        for (let button of loginButtons) {
            const text = await button.textContent();
            if (text && text.includes('Login')) {
                console.log('Found Login button:', text.trim());
                break;
            }
        }
        
        // Try to find by partial text
        const allText = await page.innerText('body');
        console.log('All text on page:');
        console.log(allText);
        
        // Check if there's a navbar
        const navbar = await page.$('nav');
        if (navbar) {
            const navText = await navbar.textContent();
            console.log('Navbar text:', navText);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

debugCurrentPage();