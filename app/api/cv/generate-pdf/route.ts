import { NextResponse } from 'next/server';
import { consumePdfExportCredit, refundConsumption } from '@/lib/billing';
import { generateCvPdfBuffer } from '@/lib/cv-pdf';
import { createClient } from '@/lib/supabase-server';

function buildContentDisposition(title: unknown) {
  const baseName = typeof title === 'string' && title.trim() ? title.trim() : 'cv';
  const sanitized = baseName.replace(/[\r\n"]/g, '').trim() || 'cv';

  const asciiFallback =
    sanitized
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '-')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cv';

  const encodedUtf8 = encodeURIComponent(sanitized)
    .replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

  return `attachment; filename="${asciiFallback}.pdf"; filename*=UTF-8''${encodedUtf8}.pdf`;
}

export async function POST(req: Request) {
  let userId: string | null = null;
  let consumption: Awaited<ReturnType<typeof consumePdfExportCredit>> | null = null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    userId = user.id;
    const cvState = await req.json();

    if (!cvState || !cvState.sections) {
      return NextResponse.json({ error: 'Invalid CV state provided' }, { status: 400 });
    }

    consumption = await consumePdfExportCredit(user.id, {
      cv_id: cvState.id || null,
      cv_title: cvState.title || null,
    });

    if (!consumption.ok && consumption.code === 'INSUFFICIENT_CREDITS') {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Buy a package to export more PDFs.',
          code: 'INSUFFICIENT_CREDITS',
          status: 402,
          wallet: {
            creditBalance: consumption.creditBalance,
            freeExportsRemaining: consumption.freeExportsRemaining,
          },
        },
        { status: 402 },
      );
    }

    if (!consumption.ok) {
      return NextResponse.json({ error: 'Could not consume export entitlement.' }, { status: 500 });
    }

    const pdfBuffer = await generateCvPdfBuffer(cvState);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': buildContentDisposition(cvState.title),
      },
    });
  } catch (error) {
    if (userId && consumption?.ok) {
      try {
        await refundConsumption(
          userId,
          'pdf_export',
          consumption.consumedCredits,
          consumption.consumedFreeExport,
          { reason: 'pdf_generation_failed' },
        );
      } catch (refundError) {
        console.error('Failed to refund PDF export entitlement:', refundError);
      }
    }

    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
