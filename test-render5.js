const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => window.scrollTo(0, 5000));
  await new Promise(r => setTimeout(r, 1000));
  
  const quote = await page.evaluate(() => {
    const el = document.getElementById('quote');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      opacity: style.opacity,
      visibility: style.visibility,
      transform: style.transform,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      display: style.display,
      html: el.innerHTML.substring(0, 500)
    };
  });
  console.log("QUOTE NODE AT 5000px:", quote);

  await browser.close();
  process.exit(0);
})();
