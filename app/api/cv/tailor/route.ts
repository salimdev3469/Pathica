import { NextResponse } from 'next/server';
import { consumeAdvancedAiCredit, refundConsumption } from '@/lib/billing';
import { proModel } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    let userId: string | null = null;
    let consumption: Awaited<ReturnType<typeof consumeAdvancedAiCredit>> | null = null;

    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        userId = user.id;

        const { cvState, jobDescription } = await req.json();

        if (!cvState || !jobDescription) {
            return NextResponse.json({ error: 'CV data and job description are required' }, { status: 400 });
        }

        consumption = await consumeAdvancedAiCredit(user.id, 'tailor', {
            cv_id: cvState?.id || null,
            input_length: String(jobDescription || '').length,
        });

        if (!consumption.ok && consumption.code === 'INSUFFICIENT_CREDITS') {
            return NextResponse.json(
                {
                    error: 'Insufficient credits. Buy a package to use advanced AI tools.',
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
            return NextResponse.json({ error: 'Could not consume AI entitlement.' }, { status: 500 });
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
            throw new Error('Failed to process AI tailoring');
        }
    } catch (error: unknown) {
        if (userId && consumption?.ok) {
            try {
                await refundConsumption(
                    userId,
                    'tailor',
                    consumption.consumedCredits,
                    consumption.consumedFreeExport,
                    { reason: 'tailor_failed' },
                );
            } catch (refundError) {
                console.error('Failed to refund tailor credits:', refundError);
            }
        }

        console.error('Tailor error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
