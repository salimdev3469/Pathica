const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => window.scrollTo(0, 3000));
  await new Promise(r => setTimeout(r, 1000));
  
  const state = await page.evaluate(() => window.__DEBUG_STATE);
  console.log("DEBUG STATE:", state);
  
  // Also check if opacity is still 0
  const opacity = await page.evaluate(() => {
    const el = document.getElementById('quote');
    return el ? window.getComputedStyle(el).opacity : 'NOT FOUND';
  });
  console.log("Quote Opacity:", opacity);

  await browser.close();
  process.exit(0);
})();
