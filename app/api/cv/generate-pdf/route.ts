import React from 'react';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const cvState = await req.json();

        if (!cvState || !cvState.sections) {
            return NextResponse.json({ error: 'Invalid CV state provided' }, { status: 400 });
        }

        // Dynamically import to avoid Next.js build-time restrictions on react-dom/server in app dir
        const { renderToStaticMarkup } = await import('react-dom/server');

        // Render the React component to a static HTML string
        const componentHtml = renderToStaticMarkup(React.createElement(CVTemplate, { cv: cvState }));

        // Wrap the component string in a full HTML document ensuring correct encoding and minimal padding for Puppeteer processing
        // Note: The CVTemplate itself has 54px padding, so body margin is 0.
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

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true, // New headless mode (true by default usually in newer versions)
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Set content and wait for it to be fully loaded
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: false, // Strict ATS matching (no backgrounds)
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
            },
            displayHeaderFooter: false,
        });

        await browser.close();

        // Increment usage limit securely if fingerprint is provided
        if (cvState.fingerprint) {
            try {
                const { data: session } = await supabaseAdmin
                    .from('anonymous_sessions')
                    .select('used_count')
                    .eq('fingerprint', cvState.fingerprint)
                    .single();

                if (session) {
                    await supabaseAdmin
                        .from('anonymous_sessions')
                        .update({ used_count: session.used_count + 1 })
                        .eq('fingerprint', cvState.fingerprint);
                }
            } catch (e) {
                console.error("Failed to update usage count", e);
            }
        }

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="cv.pdf"', // The client renames it based on state
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
