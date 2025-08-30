#!/usr/bin/env node
import { chromium } from 'playwright';

async function testCurrentApp() {
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
        await page.waitForTimeout(5000);
        
        console.log('Page title:', await page.title());
        
        // Check if navbar is loaded
        const navbar = await page.$('nav');
        console.log('Navbar found:', !!navbar);
        
        if (navbar) {
            const navText = await navbar.textContent();
            console.log('Navbar contains:', navText);
        }
        
        // Check for login/register button
        const loginButton = await page.$('button:has-text("Login/Register")');
        console.log('Login/Register button found:', !!loginButton);
        
        if (loginButton) {
            const text = await loginButton.textContent();
            console.log('Button text:', text);
            
            // Try clicking it
            await loginButton.click();
            console.log('Clicked login/register button');
            
            // Wait for modal
            await page.waitForTimeout(2000);
            
            // Check if modal appeared
            const modal = await page.$('.fixed.inset-0');
            console.log('Modal found:', !!modal);
        }
        
        // Take a screenshot
        await page.screenshot({ path: 'test-app.png' });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testCurrentApp();