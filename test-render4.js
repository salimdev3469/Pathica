const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => window.scrollTo(0, 5000));
  await new Promise(r => setTimeout(r, 1000));
  console.log("AT 5000px:", await page.evaluate(() => window.__DEBUG_STATE));
  
  await page.evaluate(() => window.scrollTo(0, 7000));
  await new Promise(r => setTimeout(r, 1000));
  console.log("AT 7000px:", await page.evaluate(() => window.__DEBUG_STATE));
  
  await page.evaluate(() => window.scrollTo(0, 9000));
  await new Promise(r => setTimeout(r, 1000));
  console.log("AT 9000px:", await page.evaluate(() => window.__DEBUG_STATE));

  await browser.close();
  process.exit(0);
})();
