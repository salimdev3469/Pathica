import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCvPdfBuffer } from '@/lib/cv-pdf';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const isGuest = !user;
    if (isGuest) {
      const cookieStore = cookies();
      const hasUsedFree = cookieStore.get('pathica_free_used')?.value;
      if (hasUsedFree === 'true') {
        return NextResponse.json(
          { error: 'Free usage limit reached. Please log in to generate unlimited CVs.' },
          { status: 403 }
        );
      }
    }

    const cvState = await req.json();

    if (!cvState || !cvState.sections) {
      return NextResponse.json({ error: 'Invalid CV state provided' }, { status: 400 });
    }

    const pdfBuffer = await generateCvPdfBuffer(cvState);

    const response = new Response(pdfBuffer as Uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cvState.title || 'cv'}.pdf"`,
      },
    });

    if (isGuest) {
      response.cookies.set('pathica_free_used', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

