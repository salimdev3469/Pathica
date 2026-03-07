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

        // Checking feature gating manually or via a helper (assumed Pro for this example)
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

        const prompt = `You are an expert technical recruiter and ATS software simulator.
    Given this CV and Job Description, return a JSON object evaluating the match.
    JSON structure constraints:
    {
      "score": number (0-100 indicating match percentage),
      "matchedKeywords": string[],
      "missingKeywords": string[],
      "suggestion": string (a short, one-sentence actionable suggestion based on missing keywords)
    }
    Return ONLY valid JSON.
    
    Job Description:
    ${jobDescription}
    
    CV:
    ${JSON.stringify(cvState)}`;

        const result = await flashModel.generateContent(prompt);
        const responseText = result.response.text();

        try {
            // Clean possible Markdown
            const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const matchData = JSON.parse(cleanedText);
            return NextResponse.json(matchData);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            return NextResponse.json({ error: 'Failed to evaluate match' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Match error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
