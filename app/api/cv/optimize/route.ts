import { NextResponse } from 'next/server';
import { proModel } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, label } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const prompt = `You are an expert CV writer and ATS optimization specialist.
Improve the following text for a CV field labeled "${label}".
Rules:
- Make it sound professional, action-oriented, and impactful.
- Use strong action verbs.
- Remove filler words or personal pronouns.
- Keep the language concise and focused on achievements/skills.
- Return ONLY the improved text, no intro, no surrounding quotes, no markdown syntax, just the plain optimized string.

Original text:
"${text}"
`;

        const result = await proModel.generateContent(prompt);
        let optimizedText = result.response.text();

        // Clean up markdown block if the model adds it
        optimizedText = optimizedText.replace(/^```.*?\\n/g, '').replace(/```$/g, '').trim();

        return NextResponse.json({ optimizedText });
    } catch (error: any) {
        console.error('Optimize error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
