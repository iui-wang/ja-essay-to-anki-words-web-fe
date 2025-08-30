#!/usr/bin/env node
import { chromium } from 'playwright';

async function debugSelectors() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });
    
    const page = await browser.newPage({
        viewport: { width: 1280, height: 720 }
    });
    
    try {
        console.log("Navigating to local frontend...");
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
        
        // Take a screenshot
        await page.screenshot({ path: './debug-homepage.png', fullPage: true });
        
        // Get all buttons
        const buttons = await page.locator('button').allTextContents();
        console.log("Buttons found:", buttons);
        
        // Get all text content
        const textContent = await page.locator('body').textContent();
        console.log("Page text content:", textContent.slice(0, 500));
        
        // Check for specific elements
        const loginButton = await page.locator('button:has-text("Login")').count();
        console.log("Login buttons found:", loginButton);
        
        const loginRegisterButton = await page.locator('button:has-text("Login/Register")').count();
        console.log("Login/Register buttons found:", loginRegisterButton);
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

debugSelectors();