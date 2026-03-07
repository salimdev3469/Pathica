import { NextResponse } from 'next/server';
import { generateCvPdfBuffer } from '@/lib/cv-pdf';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Anonymous users must verify their email to receive the CV.' },
        { status: 401 }
      );
    }

    const cvState = await req.json();

    if (!cvState || !cvState.sections) {
      return NextResponse.json({ error: 'Invalid CV state provided' }, { status: 400 });
    }

    const pdfBuffer = await generateCvPdfBuffer(cvState);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

