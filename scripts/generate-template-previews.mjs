import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const TEMPLATE_SLUGS = ['classic-ats', 'entry-starter', 'technical-impact', 'career-switch'];
const DEFAULT_PREVIEW_PAGE_URL = 'http://127.0.0.1:4010/template-previews?locale=tr';
const outputDir = path.join(process.cwd(), 'public', 'template-previews');

function getLocalChromePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : null,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  for (const candidate of paths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function waitForPreviewPage(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Preview page is not reachable: ${url}`);
}

async function generateTemplatePreviews() {
  const previewPageUrl = process.env.TEMPLATE_PREVIEW_PAGE_URL || DEFAULT_PREVIEW_PAGE_URL;
  const chromePath = getLocalChromePath();

  if (!chromePath) {
    throw new Error('Chrome executable not found. Install Chrome or set a compatible local browser path.');
  }

  await fs.promises.mkdir(outputDir, { recursive: true });
  await waitForPreviewPage(previewPageUrl);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1800, deviceScaleFactor: 2 });
    await page.goto(previewPageUrl, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => (document.fonts ? document.fonts.status === 'loaded' : true));

    for (const slug of TEMPLATE_SLUGS) {
      const selector = `[data-template-frame="${slug}"]`;
      await page.waitForSelector(selector, { timeout: 30000 });
      const handle = await page.$(selector);

      if (!handle) {
        throw new Error(`Template frame not found for slug: ${slug}`);
      }

      const outputPath = path.join(outputDir, `${slug}.png`);
      await handle.screenshot({
        path: outputPath,
        type: 'png',
      });

      console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
    }
  } finally {
    await browser.close();
  }
}

generateTemplatePreviews().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
