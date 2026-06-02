import { NextResponse } from 'next/server';
import { consumeAdvancedAiCredit, refundConsumption } from '@/lib/billing';
import { flashModel } from '@/lib/gemini';
import { extractEmbeddedKeywords, extractJobKeywords, extractMissingKeywords } from '@/lib/job-keywords';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

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

        const { jobDescription, cvState } = await req.json();

        if (!jobDescription || !cvState) {
            return NextResponse.json({ error: 'jobDescription and cvState are required' }, { status: 400 });
        }

        const cvTextBefore = buildCvKeywordText(cvState);
        const extractedKeywords = extractJobKeywords(String(jobDescription), 24);
        const missingBefore = extractMissingKeywords(String(jobDescription), cvTextBefore, 15);

        consumption = await consumeAdvancedAiCredit(user.id, 'match_job', {
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

        const prompt = `You are an expert ATS optimizer and resume writer.
You are given a job description and a candidate CV JSON.

Goal:
Tailor the CV wording to the job description by naturally integrating relevant keywords, while keeping the CV truthful.

Hard rules:
1) Keep the exact same JSON shape and IDs. Do not remove fields.
2) Do not invent fake jobs, projects, education, certificates, dates, or employers.
3) Only improve wording in existing summary/bullets/subtitles/titles where relevant.
4) Integrate relevant keywords naturally (no keyword stuffing).
5) Return valid JSON only, no markdown fences.

Return this exact JSON schema:
{
  "score": number,
  "feedback": "string",
  "missingSkills": ["string"],
  "extractedKeywords": ["string"],
  "improvedCvState": { ... }
}

Keyword candidates extracted from the job description:
${extractedKeywords.join(', ')}

Current likely-missing keywords in CV:
${missingBefore.join(', ')}

Job Description:
${String(jobDescription).substring(0, 4500)}

Current CV State (JSON):
${JSON.stringify(cvState)}`;

        const result = await flashModel.generateContent(prompt);
        const rawResponse = result.response.text();
        const parsed = parseModelResponse(rawResponse);

        const parsedRecord = asRecord(parsed);
        const improvedCandidate = parsedRecord?.improvedCvState;
        const improvedCvState = sanitizeImprovedCvState(improvedCandidate, cvState);

        if (asRecord(improvedCvState)) {
            const improvedAsRecord = improvedCvState as Record<string, unknown>;
            improvedAsRecord.id = asRecord(cvState)?.id || improvedAsRecord.id;
            if (typeof asRecord(cvState)?.title === 'string') {
                improvedAsRecord.title = asRecord(cvState)?.title;
            }
        }

        const modelExtracted = toStringList(parsedRecord?.extractedKeywords);
        const extracted = dedupeKeywords([...extractedKeywords, ...modelExtracted], 24);

        const improvedCvText = buildCvKeywordText(improvedCvState);
        const embeddedKeywords = extractEmbeddedKeywords(improvedCvText, extracted, 20);
        const missingAfter = extracted.filter((keyword) => !embeddedKeywords.includes(keyword)).slice(0, 15);
        const modelMissing = toStringList(parsedRecord?.missingSkills);
        const missingSkills = dedupeKeywords([...modelMissing, ...missingAfter], 15);

        const score = clampScore(
            typeof parsedRecord?.score === 'number' ? parsedRecord.score : estimateScoreFromCoverage(extracted, embeddedKeywords),
        );

        const feedback =
            typeof parsedRecord?.feedback === 'string' && parsedRecord.feedback.trim().length > 0
                ? parsedRecord.feedback.trim()
                : buildFallbackFeedback(score, missingSkills);

        return NextResponse.json({
            score,
            feedback,
            missingSkills,
            extractedKeywords: extracted,
            embeddedKeywords,
            improvedCvState,
        });

    } catch (error: unknown) {
        if (userId && consumption?.ok) {
            try {
                await refundConsumption(
                    userId,
                    'match_job',
                    consumption.consumedCredits,
                    consumption.consumedFreeExport,
                    { reason: 'match_job_failed' },
                );
            } catch (refundError) {
                console.error('Failed to refund match-job credits:', refundError);
            }
        }

        console.error('Job Match Error:', error);
        return NextResponse.json({ error: 'Failed to match job' }, { status: 500 });
    }
}

function parseModelResponse(raw: string): unknown {
    const cleaned = raw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    try {
        return JSON.parse(cleaned) as unknown;
    } catch {
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) {
            return null;
        }

        try {
            return JSON.parse(cleaned.slice(first, last + 1)) as unknown;
        } catch {
            return null;
        }
    }
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

function toStringList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : ''))
        .filter(Boolean);
}

function dedupeKeywords(keywords: string[], limit: number): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const keyword of keywords) {
        const normalized = keyword.trim().toLowerCase();
        if (!normalized || seen.has(normalized)) {
            continue;
        }

        seen.add(normalized);
        result.push(normalized);

        if (result.length >= limit) {
            break;
        }
    }

    return result;
}

function sanitizeImprovedCvState(candidate: unknown, fallback: unknown): unknown {
    const candidateRecord = asRecord(candidate);
    if (!candidateRecord) {
        return fallback;
    }

    if (!Array.isArray(candidateRecord.sections)) {
        return fallback;
    }

    return candidateRecord;
}

function buildCvKeywordText(cvState: unknown): string {
    const record = asRecord(cvState);
    if (!record) {
        return '';
    }

    const parts: string[] = [];

    pushIfString(parts, record.title);
    pushIfString(parts, record.summaryTitle);
    pushIfString(parts, record.summary);

    const personalInfo = asRecord(record.personalInfo);
    if (personalInfo) {
        for (const value of Object.values(personalInfo)) {
            pushIfString(parts, value);
        }
    }

    const sections = Array.isArray(record.sections) ? record.sections : [];
    for (const section of sections) {
        const sectionRecord = asRecord(section);
        if (!sectionRecord) {
            continue;
        }

        pushIfString(parts, sectionRecord.title);
        const items = Array.isArray(sectionRecord.items) ? sectionRecord.items : [];
        for (const item of items) {
            const itemRecord = asRecord(item);
            if (!itemRecord) {
                continue;
            }

            pushIfString(parts, itemRecord.title);
            pushIfString(parts, itemRecord.subtitle);
            pushIfString(parts, itemRecord.location);
            pushIfString(parts, itemRecord.bullets);
        }
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function pushIfString(parts: string[], value: unknown) {
    if (typeof value !== 'string') {
        return;
    }

    const normalized = value.trim();
    if (normalized) {
        parts.push(normalized);
    }
}

function estimateScoreFromCoverage(extracted: string[], embedded: string[]): number {
    if (extracted.length === 0) {
        return 70;
    }

    const coverage = embedded.length / extracted.length;
    return Math.round(52 + coverage * 48);
}

function clampScore(score: number): number {
    if (!Number.isFinite(score)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

function buildFallbackFeedback(score: number, missingSkills: string[]): string {
    if (score >= 80) {
        return 'Strong alignment. Keep polishing quantified outcomes and keep terminology consistent with the job description.';
    }

    if (missingSkills.length === 0) {
        return 'Moderate alignment. Improve role fit by making achievements more measurable and role-specific.';
    }

    return `Moderate alignment. Add or emphasize these keywords where truthful: ${missingSkills.slice(0, 6).join(', ')}.`;
}
