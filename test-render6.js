const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => window.scrollTo(0, 5000));
  await new Promise(r => setTimeout(r, 1000));
  
  const layout = await page.evaluate(() => {
    const quote = document.getElementById('quote');
    const stickyContainer = quote.parentElement;
    const preStack = stickyContainer.parentElement;
    return {
      quote: quote.getBoundingClientRect().top,
      stickyContainer: stickyContainer.getBoundingClientRect().top,
      stickyContainerPosition: window.getComputedStyle(stickyContainer).position,
      preStack: preStack.getBoundingClientRect().top,
      preStackPosition: window.getComputedStyle(preStack).position,
    };
  });
  console.log("LAYOUT:", layout);

  await browser.close();
  process.exit(0);
})();
