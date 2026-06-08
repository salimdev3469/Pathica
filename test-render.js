const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Navigate to localhost
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Scroll down by 3000px to reach QuoteSlide
  await page.evaluate(() => {
    window.scrollTo(0, 3000);
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const quoteHtml = await page.evaluate(() => {
    const el = document.getElementById('quote');
    return el ? el.outerHTML : 'NOT FOUND';
  });
  
  const opacity = await page.evaluate(() => {
    const el = document.getElementById('quote');
    return el ? window.getComputedStyle(el).opacity : 'NOT FOUND';
  });
  
  const visibility = await page.evaluate(() => {
    const el = document.getElementById('quote');
    return el ? window.getComputedStyle(el).visibility : 'NOT FOUND';
  });
  
  const height = await page.evaluate(() => {
    const el = document.getElementById('quote');
    return el ? el.getBoundingClientRect().height : 'NOT FOUND';
  });
  
  const childrenHeight = await page.evaluate(() => {
    const el = document.querySelector('#quote > div > div > div > div');
    return el ? el.getBoundingClientRect().height : 'NOT FOUND';
  });

  console.log('Opacity:', opacity);
  console.log('Visibility:', visibility);
  console.log('Section Height:', height);
  console.log('Inner Content Height:', childrenHeight);
  
  fs.writeFileSync('quote_dom.html', quoteHtml);

  await browser.close();
  process.exit(0);
})();
