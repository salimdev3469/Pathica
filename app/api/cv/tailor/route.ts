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

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('user_id', user.id)
            .single();

        if (!subscription || subscription.plan === 'free') {
            return NextResponse.json({ error: 'Upgrade to Pro to use AI features.' }, { status: 403 });
        }

        const { cvState, jobDescription } = await req.json();

        if (!cvState || !jobDescription) {
            return NextResponse.json({ error: 'CV data and job description are required' }, { status: 400 });
        }

        const prompt = `You are a professional technical recruiter and resume writer.
    Your task is to tailor the provided CV JSON to perfectly match the target Job Description while keeping the information truthful.
    Rules:
    - Retain the exact same overall JSON structure.
    - Emphasize skills and experiences that align with the job description.
    - Rewrite achievements to use keywords from the job description naturally.
    - Only return the valid JSON, with absolutely NO markdown formatting blocks like \`\`\`json. NO explanation.

    Job Description:
    ${jobDescription}

    Original CV JSON:
    ${JSON.stringify(cvState)}`;

        const result = await proModel.generateContent(prompt);
        const responseText = result.response.text();

        try {
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const tailoredCV = JSON.parse(cleanedText);
            return NextResponse.json(tailoredCV);
        } catch (parseError) {
            console.error('Failed to parse tailored CV JSON:', parseError);
            return NextResponse.json({ error: 'Failed to process AI tailoring' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Tailor error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
