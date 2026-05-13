import { NextResponse } from 'next/server';
import { consumeAdvancedAiCredit, refundConsumption } from '@/lib/billing';
import { flashModel } from '@/lib/gemini';
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

        const { cvState, jobDescription, company } = await req.json();

        if (!cvState || !jobDescription) {
            return NextResponse.json({ error: 'CV and Job Description are required' }, { status: 400 });
        }

        consumption = await consumeAdvancedAiCredit(user.id, 'cover_letter', {
            cv_id: cvState?.id || null,
            input_length: String(jobDescription || '').length,
            company: company || null,
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
    } catch (error: unknown) {
        if (userId && consumption?.ok) {
            try {
                await refundConsumption(
                    userId,
                    'cover_letter',
                    consumption.consumedCredits,
                    consumption.consumedFreeExport,
                    { reason: 'cover_letter_failed' },
                );
            } catch (refundError) {
                console.error('Failed to refund cover-letter credits:', refundError);
            }
        }

        console.error('Cover letter error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
