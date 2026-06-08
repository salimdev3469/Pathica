const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => window.scrollTo(0, 3000));
  await new Promise(r => setTimeout(r, 1000));
  
  const state = await page.evaluate(() => {
    // We can't access React state directly, but we can read the DOM data-slide active logic if we inject a global, or we just scroll incrementally
    return window.scrollY;
  });
  console.log("scrollY:", state);

  await browser.close();
  process.exit(0);
})();
