const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('Filling idea...');
    await page.fill('textarea', "small independent food vendors, campus cafeterias or even households often have surplus food that is perfectly edible but is often thrown away due to tight sell by the dates or simple excess. A platform connecting this small highly perishable surplus to nearby students or community members who need it quickly");
    
    console.log('Clicking Analyze...');
    await page.click('button:has-text("Analyze Idea")');
    
    console.log('Waiting for onboarding modal / First question...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\test_step1.png' });
    
    // Fill the form (4 questions). Next button is 'Continue ->'
    for (let i = 0; i < 3; i++) {
        const input = await page.$('input[type="text"]');
        if (input) {
            await input.fill('Students and Local community');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }
    }

    // Step 4 is buttons, e.g. "Just an idea"
    const ideaBtn = await page.$('button:has-text("Just an idea")');
    if (ideaBtn) {
        await ideaBtn.click();
        await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\test_step2.png' });
    
    // Auth form inside the onboarding
    console.log('Filling auth...');
    const nameInput = await page.$('input[placeholder*="Name"]');
    if (nameInput) await nameInput.fill('Tester');
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) await emailInput.fill('test@example.com');
    
    await page.screenshot({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\test_step3.png' });
    
    const submitBtn = await page.$('button:has-text("Complete Validation")');
    if (submitBtn) await submitBtn.click();
    
    console.log('Waiting for analysis to complete (up to 90s)...');
    await page.waitForSelector('#founderos-report, .error-message', { timeout: 90000 });
    
    await page.waitForTimeout(2000); 
    await page.screenshot({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\test_final.png', fullPage: true });
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\test_error.png' });
  } finally {
    await browser.close();
  }
})();
