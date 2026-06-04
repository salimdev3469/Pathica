import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: review, error: reviewError } = await supabase
      .from('resume_reviews')
      .select('file_path, file_type, file_name')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (!review.file_path) {
      return NextResponse.json({ error: 'Original file not stored' }, { status: 404 });
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resume_reviews_files')
      .download(review.file_path);

    if (downloadError || !fileData) {
      console.error('File download error:', downloadError);
      return NextResponse.json({ error: 'Could not download file from storage' }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const contentType = review.file_type === 'pdf' ? 'application/pdf' 
      : review.file_type === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'text/plain';

    const encodedFileName = encodeURIComponent(review.file_name);
    const asciiFileName = review.file_name.replace(/[^\x20-\x7E]/g, '_');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
