import { NextResponse } from 'next/server';
import { flashModel } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { jobDescription, cvState } = await req.json();

        if (!jobDescription || !cvState) {
            return NextResponse.json({ error: 'jobDescription and cvState are required' }, { status: 400 });
        }

        const prompt = `You are an expert ATS optimizer and career coach.
You are given a Job Description and a Candidate's current CV (Resume).
Your task is to:
1. Calculate a match score (0-100) indicating how well the current CV fits the Job Description.
2. Provide a short, actionable feedback paragraph about the fit.
3. List the top missing skills or keywords that the candidate should add if they have the experience.
4. Provide an IMPROVED version of the CV State. In the improved version, subtly rewrite bullet points to include important keywords from the job description or highlight relevant experiences better. DO NOT invent fake experiences, just optimize the phrasing and keywords of existing items.

Respond ONLY with a valid JSON document matching this structure:
{
  "score": number, // 0 to 100
  "feedback": "string",
  "missingSkills": ["skill1", "skill2"],
  "improvedCvState": { ... } // Detailed CVState object that matches the original structure but with optimized text
}

Job Description:
${jobDescription.substring(0, 3000)}

Current CV State (JSON):
${JSON.stringify(cvState)}
`;

        const result = await flashModel.generateContent(prompt);
        const rawResponse = result.response.text();
        const cleaned = rawResponse
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleaned);
        
        // Ensure improvedCvState inherits the id so we can use it safely, although we will clone it later.
        if (parsed.improvedCvState) {
            parsed.improvedCvState.id = cvState.id;
        }

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('Job Match Error:', error);
        return NextResponse.json({ error: 'Failed to match job' }, { status: 500 });
    }
}
