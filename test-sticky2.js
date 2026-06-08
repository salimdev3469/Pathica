const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const html = `
  <!DOCTYPE html>
  <html style="overflow-x: clip;">
    <body style="overflow-x: clip; margin: 0; padding: 0;">
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
  
  console.log("Sticky top with overflow-x-clip:", pos);

  await browser.close();
  process.exit(0);
})();
