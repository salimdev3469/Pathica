import { NextResponse } from 'next/server';
import { flashModel } from '@/lib/gemini';
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
            return NextResponse.json({ error: 'This feature is currently unavailable.' }, { status: 403 });
        }

        const { cvState, jobDescription, company } = await req.json();

        if (!cvState || !jobDescription) {
            return NextResponse.json({ error: 'CV and Job Description are required' }, { status: 400 });
        }

        const prompt = `You are an expert career coach. Write a customized, ATS-friendly cover letter based on this CV and Job Description.
    Rules:
    - Return plain text only. No markdown formatting.
    - Exactly 3 paragraphs: 
      1) Introduction (state role applied for, enthusiasm, and a hook based on experience)
      2) Body (highlight 2-3 specific achievements from the CV that map directly to the job description)
      3) Conclusion (reiterate enthusiasm, cultural fit, and call to action)
    - Do not use placeholder brackets like [Your Name]. Use the actual name and details from the CV if available. If not, omit them gracefully.
    - The target company is: ${company || 'the target company'}.

    Job Description:
    ${jobDescription}

    CV Data:
    ${JSON.stringify(cvState)}`;

        const result = await flashModel.generateContent(prompt);
        const responseText = result.response.text();

        return NextResponse.json({ coverLetter: responseText });
    } catch (error: any) {
        console.error('Cover letter error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

