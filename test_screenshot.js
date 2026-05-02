const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1800 } });
  
  try {
    await page.goto('http://localhost:3000/debug', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\founder_os_report.png', fullPage: true });
    await page.pdf({ path: 'C:\\Users\\Ankush\\.gemini\\antigravity\\artifacts\\FounderOS_Report_Surplus_Food.pdf', format: 'A4', printBackground: true });
    console.log('Test completed successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
