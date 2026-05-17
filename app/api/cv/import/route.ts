import { NextResponse } from 'next/server';
import { flashModel } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';
import { normalizeImportedCvDraft } from '@/lib/cv-import';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx'];

function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function extractJsonObject(rawText: string): string {
  const withoutMarkdown = rawText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  const start = withoutMarkdown.indexOf('{');
  const end = withoutMarkdown.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return withoutMarkdown;
  }

  return withoutMarkdown.slice(start, end + 1);
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const fileEntry = formData.get('file');
    const locale = formData.get('locale') === 'tr' ? 'tr' : 'en';

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    if (!fileEntry.size || fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error:
            locale === 'tr'
              ? 'Dosya boyutu 5MB altında olmalı.'
              : 'File size must be below 5MB.',
        },
        { status: 400 },
      );
    }

    const hasAllowedMime = ALLOWED_MIME_TYPES.has(fileEntry.type);
    const hasAllowedExt = hasAllowedExtension(fileEntry.name || '');
    if (!hasAllowedMime && !hasAllowedExt) {
      return NextResponse.json(
        {
          error:
            locale === 'tr'
              ? 'Lütfen PDF, DOC, DOCX veya TXT dosyası yükleyin.'
              : 'Please upload a PDF, DOC, DOCX, or TXT file.',
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const prompt = `You are an expert resume parser.
Extract structured data from the attached resume/CV file and return ONLY a valid JSON object.

Required JSON schema:
{
  "title": "string",
  "personalInfo": {
    "fullName": "string",
    "jobTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string",
    "github": "string"
  },
  "summaryTitle": "string",
  "summary": "string",
  "sections": [
    {
      "title": "string",
      "items": [
        {
          "title": "string",
          "subtitle": "string",
          "date": "string",
          "location": "string",
          "bullets": "string"
        }
      ]
    }
  ]
}

Rules:
- Do not use markdown or code fences.
- Use empty strings when information is missing.
- Keep text factual and extracted from the document. Do not invent content.
- Keep original language used in the resume text.
- For bullets fields, combine multiple bullet points with newline separators.
- If there is no clear summary title, use "Profile Summary".
`;

    const result = await flashModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: fileEntry.type || 'application/octet-stream',
                data: buffer.toString('base64'),
              },
            },
          ],
        },
      ],
    });

    const rawResponse = result.response.text();
    const jsonText = extractJsonObject(rawResponse);
    const parsed = JSON.parse(jsonText) as unknown;
    const importedCv = normalizeImportedCvDraft(parsed);

    if (
      !importedCv.title &&
      !importedCv.summary &&
      !importedCv.summaryTitle &&
      !importedCv.personalInfo &&
      (!importedCv.sections || importedCv.sections.length === 0)
    ) {
      return NextResponse.json(
        {
          error:
            locale === 'tr'
              ? 'Dosya içeriği okunamadı. Daha net bir CV dosyası deneyin.'
              : 'Could not parse content from the file. Please try a clearer resume file.',
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ importedCv });
  } catch (error) {
    console.error('CV import error:', error);
    return NextResponse.json({ error: 'Failed to import CV.' }, { status: 500 });
  }
}
