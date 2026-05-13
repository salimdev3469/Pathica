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

        const { cvState, jobDescription, company, jobTitle, language = 'tr', tone = 'professional', length = 'medium' } = await req.json();

        if (!cvState) {
            return NextResponse.json({ error: 'CV data is required' }, { status: 400 });
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

        let lengthPrompt = 'Exactly 3 paragraphs';
        if (length === 'short') lengthPrompt = '1-2 short paragraphs, concise and direct';
        if (length === 'long') lengthPrompt = '3-4 detailed paragraphs, thoroughly explaining fit';

        const prompt = `You are an expert career coach writing a customized, ATS-friendly cover letter.
    Rules:
    - Return plain text only. No markdown formatting.
    - Write in ${language === 'tr' ? 'Turkish' : language === 'en' ? 'English' : language}.
    - Tone should be ${tone}.
    - Length: ${lengthPrompt}.
    - Do not use placeholder brackets like [Your Name]. Use the actual name and details from the CV if available. If not, omit them gracefully.
    - Target Job Title: ${jobTitle || 'the position'}.
    - Target Company: ${company || 'the target company'}.

    ${jobDescription ? `Job Description:\n${jobDescription}` : 'No job description provided. Focus on highlighting the best aspects of the CV for the Target Job Title.'}

    CV Data:
    ${JSON.stringify(cvState)}`;

        const result = await flashModel.generateContent(prompt);
        const responseText = result.response.text();

        const { data: savedCoverLetter, error: dbError } = await supabase
            .from('cover_letters')
            .insert({
                user_id: user.id,
                cv_id: cvState.id || null,
                job_title: jobTitle || null,
                company_name: company || null,
                job_description: jobDescription || null,
                content: responseText,
                language,
                tone,
                length,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Failed to save cover letter to DB:', dbError);
        }

        return NextResponse.json({ 
            coverLetter: responseText,
            id: savedCoverLetter?.id 
        });
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
