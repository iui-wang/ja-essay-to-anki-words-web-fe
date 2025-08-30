#!/usr/bin/env node
import { chromium } from 'playwright';

async function debugPageDetail() {
    let browser;
    let page;
    
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 2000
        });
        
        page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        
        // Listen for console messages
        page.on('console', msg => console.log('CONSOLE:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error));
        
        console.log('Navigating to http://localhost:5175...');
        await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
        
        // Wait a bit longer
        await page.waitForTimeout(5000);
        
        console.log('Page title:', await page.title());
        console.log('URL:', page.url());
        
        // Get the full HTML
        const html = await page.content();
        console.log('Full HTML:');
        console.log(html);
        
        // Check for specific selectors
        const navbar = await page.$('nav');
        console.log('Navbar found:', !!navbar);
        
        const buttons = await page.$$('button');
        console.log('All buttons found:', buttons.length);
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            const className = await buttons[i].getAttribute('class');
            console.log(`Button ${i}: "${text}" class: ${className}`);
        }
        
        // Check for any text content
        const allText = await page.innerText('body');
        console.log('All text content:');
        console.log(allText);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

debugPageDetail();