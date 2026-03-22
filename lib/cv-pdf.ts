import React from 'react';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { CVTemplate } from '@/components/pdf/CVTemplate';

export async function generateCvPdfBuffer(cvState: any): Promise<Buffer> {
  if (!cvState || !cvState.sections) {
    throw new Error('Invalid CV state provided');
  }

  const { renderToStaticMarkup } = await import('react-dom/server');

  const componentHtml = renderToStaticMarkup(React.createElement(CVTemplate, { cv: cvState }));

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${cvState.title || 'CV'}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: white;
          font-family: Arial, Helvetica, sans-serif;
          color: #000000;
        }
      </style>
    </head>
    <body>
      ${componentHtml}
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: false,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      displayHeaderFooter: false,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

