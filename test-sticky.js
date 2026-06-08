const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const html = `
  <!DOCTYPE html>
  <html style="overflow-x: hidden;">
    <body style="overflow-x: hidden; margin: 0; padding: 0;">
      <div style="height: 1000px; background: red;">SPACER 1</div>
      <div id="container" style="height: 5000px; background: blue; position: relative;">
        <div id="sticky" style="position: sticky; top: 0; height: 500px; background: yellow;">STICKY</div>
      </div>
      <div style="height: 1000px; background: green;">SPACER 2</div>
    </body>
  </html>
  `;
  
  await page.setContent(html);
  await page.setViewport({ width: 1440, height: 900 });
  
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 100));
  
  const pos = await page.evaluate(() => {
    return document.getElementById('sticky').getBoundingClientRect().top;
  });
  
  console.log("Sticky top with overflow-x-hidden:", pos);

  const html2 = `
  <!DOCTYPE html>
  <html>
    <body style="margin: 0; padding: 0;">
      <div style="height: 1000px; background: red;">SPACER 1</div>
      <div id="container" style="height: 5000px; background: blue; position: relative;">
        <div id="sticky" style="position: sticky; top: 0; height: 500px; background: yellow;">STICKY</div>
      </div>
      <div style="height: 1000px; background: green;">SPACER 2</div>
    </body>
  </html>
  `;
  
  await page.setContent(html2);
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 100));
  
  const pos2 = await page.evaluate(() => {
    return document.getElementById('sticky').getBoundingClientRect().top;
  });
  
  console.log("Sticky top WITHOUT overflow-x-hidden:", pos2);

  await browser.close();
  process.exit(0);
})();
