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
        
        console.log('Navigating to http://localhost:5175...');
        await page.goto('http://localhost:5175');
        await page.waitForLoadState('networkidle');
        
        console.log('Page loaded. Taking screenshot...');
        await page.screenshot({ path: 'debug-screenshot.png' });
        
        console.log('Page title:', await page.title());
        
        // Get all button texts
        const buttons = await page.$$('button');
        console.log('Found buttons:');
        for (const button of buttons) {
            const text = await button.textContent();
            console.log(`- "${text}"`);
        }
        
        // Get all text content
        const bodyText = await page.textContent('body');
        console.log('Page content preview:');
        console.log(bodyText.substring(0, 500));
        
        // Check for specific elements
        const loginButton = await page.$('button:has-text("Login/Register")');
        console.log('Login/Register button found:', !!loginButton);
        
        const loginButton2 = await page.$('button:has-text("Login")');
        console.log('Login button found:', !!loginButton2);
        
        const registerButton = await page.$('button:has-text("Register")');
        console.log('Register button found:', !!registerButton);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

debugPage();