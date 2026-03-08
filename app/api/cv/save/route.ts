import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { flashModel } from '@/lib/gemini';
import { normalizeCvFont } from '@/lib/cv-fonts';
import { createClient } from '@/lib/supabase-server';

type SaveItem = {
    title?: string;
    subtitle?: string;
    date?: string;
    location?: string;
    bullets?: string;
    position?: number;
};

type SaveSection = {
    title?: string;
    position?: number;
    items?: SaveItem[];
};

type SaveCvState = {
    id: string;
    title?: string;
    fontFamily?: string;
    personalInfo?: {
        fullName?: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        portfolio?: string;
        github?: string;
        photoDataUrl?: string;
        photoX?: number;
        photoY?: number;
        photoSize?: number;
    };
    summaryTitle?: string;
    summary?: string;
    sections?: SaveSection[];
};

type AtsMeta = {
    score: number;
    reason: string;
    signature: string;
    source: 'ai' | 'heuristic' | 'cached';
};

type CvFieldMetaRow = {
    label: string;
    value: string;
};

type PreviousAtsSectionRow = {
    cv_fields?: CvFieldMetaRow[];
};

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cvState = (await req.json()) as SaveCvState;

        if (!cvState || !cvState.id) {
            return NextResponse.json({ error: 'Invalid CV state' }, { status: 400 });
        }

        // Verify ownership
        const { data: cvCheck } = await supabase
            .from('cvs')
            .select('id')
            .eq('id', cvState.id)
            .eq('user_id', user.id)
            .single();

        if (!cvCheck) {
            return NextResponse.json({ error: 'CV not found or unauthorized' }, { status: 404 });
        }

        const currentSignature = buildAtsSignature(cvState);

        // Read previous ATS metadata before deleting sections.
        const { data: previousAtsRows } = await supabase
            .from('cv_sections')
            .select('cv_fields(label,value)')
            .eq('cv_id', cvState.id)
            .eq('title', '_ats_meta')
            .limit(1);

        const previousAts = parsePreviousAtsMeta((previousAtsRows as PreviousAtsSectionRow[] | null)?.[0]);

        let atsMeta: AtsMeta;
        if (
            previousAts &&
            previousAts.signature === currentSignature &&
            Number.isFinite(previousAts.score) &&
            previousAts.reason.length > 0
        ) {
            atsMeta = {
                score: previousAts.score,
                reason: previousAts.reason,
                signature: currentSignature,
                source: 'cached',
            };
        } else {
            const aiScore = await calculateAtsWithAi(cvState);
            if (aiScore) {
                atsMeta = {
                    ...aiScore,
                    signature: currentSignature,
                    source: 'ai',
                };
            } else {
                const fallback = calculateHeuristicAts(cvState);
                atsMeta = {
                    ...fallback,
                    signature: currentSignature,
                    source: 'heuristic',
                };
            }
        }

        // Update CV title
        await supabase
            .from('cvs')
            .update({ title: cvState.title, updated_at: new Date().toISOString() })
            .eq('id', cvState.id);

        // Simplest way to update sections/fields perfectly is to delete old and insert new.
        await supabase.from('cv_sections').delete().eq('cv_id', cvState.id);

        // 1. Insert _personal_info section
        const { data: piSection } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_personal_info', position: -2 })
            .select()
            .single();

        if (piSection && cvState.personalInfo) {
            await supabase.from('cv_fields').insert({
                section_id: piSection.id,
                label: 'personal_info',
                value: JSON.stringify(cvState.personalInfo),
                field_type: 'json',
                position: 0,
            });
        }

        // 2. Insert _summary section
        const { data: summarySection } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_summary', position: -1 })
            .select()
            .single();

        if (summarySection) {
            const summaryFields: Array<{ section_id: string; label: string; value: string; field_type: string; position: number }> = [];

            if (typeof cvState.summary === 'string') {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'summary',
                    value: cvState.summary,
                    field_type: 'text',
                    position: 0,
                });
            }

            if (typeof cvState.summaryTitle === 'string' && cvState.summaryTitle.trim()) {
                summaryFields.push({
                    section_id: summarySection.id,
                    label: 'summary_title',
                    value: cvState.summaryTitle,
                    field_type: 'text',
                    position: 1,
                });
            }

            summaryFields.push({
                section_id: summarySection.id,
                label: 'font_family',
                value: normalizeCvFont(cvState.fontFamily),
                field_type: 'text',
                position: 2,
            });

            if (summaryFields.length > 0) {
                await supabase.from('cv_fields').insert(summaryFields);
            }
        }

        // 3. Insert normal user sections
        const sections = Array.isArray(cvState.sections) ? cvState.sections : [];
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const { data: sectionData, error: sectionError } = await supabase
                .from('cv_sections')
                .insert({
                    cv_id: cvState.id,
                    title: section.title,
                    position: typeof section.position === 'number' ? section.position : i,
                })
                .select()
                .single();

            if (sectionError) throw sectionError;

            if (section.items && section.items.length > 0) {
                const fieldsToInsert = section.items.map((item, itemIndex) => ({
                    section_id: sectionData.id,
                    label: item.title || 'item',
                    value: JSON.stringify(item),
                    field_type: 'item',
                    position: typeof item.position === 'number' ? item.position : itemIndex,
                }));

                const { error: fieldsError } = await supabase.from('cv_fields').insert(fieldsToInsert);
                if (fieldsError) throw fieldsError;
            }
        }

        // 4. Persist ATS metadata as virtual section
        const { data: atsSection, error: atsSectionError } = await supabase
            .from('cv_sections')
            .insert({ cv_id: cvState.id, title: '_ats_meta', position: -3 })
            .select()
            .single();

        if (atsSectionError) {
            console.error('Failed to create ATS metadata section:', atsSectionError);
        } else if (atsSection) {
            const { error: atsFieldsError } = await supabase.from('cv_fields').insert([
                {
                    section_id: atsSection.id,
                    label: 'score',
                    value: String(atsMeta.score),
                    field_type: 'number',
                    position: 0,
                },
                {
                    section_id: atsSection.id,
                    label: 'reason',
                    value: atsMeta.reason,
                    field_type: 'text',
                    position: 1,
                },
                {
                    section_id: atsSection.id,
                    label: 'signature',
                    value: atsMeta.signature,
                    field_type: 'text',
                    position: 2,
                },
                {
                    section_id: atsSection.id,
                    label: 'source',
                    value: atsMeta.source,
                    field_type: 'text',
                    position: 3,
                },
            ]);

            if (atsFieldsError) {
                console.error('Failed to persist ATS metadata fields:', atsFieldsError);
            }
        }

        return NextResponse.json({
            success: true,
            ats: {
                score: atsMeta.score,
                reason: atsMeta.reason,
                source: atsMeta.source,
            },
        });
    } catch (error) {
        console.error('Error saving CV:', error);
        return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
    }
}

function parsePreviousAtsMeta(section: PreviousAtsSectionRow | undefined) {
    if (!section || !Array.isArray(section.cv_fields)) {
        return null;
    }

    const scoreRaw = section.cv_fields.find((field) => field.label === 'score')?.value;
    const reasonRaw = section.cv_fields.find((field) => field.label === 'reason')?.value || '';
    const signatureRaw = section.cv_fields.find((field) => field.label === 'signature')?.value || '';

    const parsedScore = Number(scoreRaw);

    if (!Number.isFinite(parsedScore) || !reasonRaw || !signatureRaw) {
        return null;
    }

    return {
        score: Math.max(0, Math.min(100, Math.round(parsedScore))),
        reason: reasonRaw,
        signature: signatureRaw,
    };
}

function buildAtsSignature(cvState: SaveCvState): string {
    const normalized = {
        title: normalize(cvState.title),
        personalInfo: {
            fullName: normalize(cvState.personalInfo?.fullName),
            email: normalize(cvState.personalInfo?.email),
            phone: normalize(cvState.personalInfo?.phone),
            location: normalize(cvState.personalInfo?.location),
            linkedin: normalize(cvState.personalInfo?.linkedin),
            portfolio: normalize(cvState.personalInfo?.portfolio),
            github: normalize(cvState.personalInfo?.github),
            photoDataUrl: normalize(cvState.personalInfo?.photoDataUrl),
            photoX: typeof cvState.personalInfo?.photoX === 'number' ? cvState.personalInfo.photoX : undefined,
            photoY: typeof cvState.personalInfo?.photoY === 'number' ? cvState.personalInfo.photoY : undefined,
            photoSize: typeof cvState.personalInfo?.photoSize === 'number' ? cvState.personalInfo.photoSize : undefined,
        },
        summary: normalize(cvState.summary),
        fontFamily: normalizeCvFont(cvState.fontFamily),
        sections: (Array.isArray(cvState.sections) ? cvState.sections : [])
            .map((section, sectionIndex) => ({
                title: normalize(section.title),
                position: typeof section.position === 'number' ? section.position : sectionIndex,
                items: (Array.isArray(section.items) ? section.items : [])
                    .map((item, itemIndex) => ({
                        title: normalize(item.title),
                        subtitle: normalize(item.subtitle),
                        date: normalize(item.date),
                        location: normalize(item.location),
                        bullets: normalize(item.bullets),
                        position: typeof item.position === 'number' ? item.position : itemIndex,
                    }))
                    .sort((a, b) => a.position - b.position),
            }))
            .sort((a, b) => a.position - b.position),
    };

    return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

async function calculateAtsWithAi(cvState: SaveCvState): Promise<{ score: number; reason: string } | null> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return null;
        }

        const compactCv = {
            title: cvState.title || '',
            summary: cvState.summary || '',
            personalInfo: cvState.personalInfo || {},
            sections: (Array.isArray(cvState.sections) ? cvState.sections : []).slice(0, 12).map((section) => ({
                title: section.title || '',
                items: (Array.isArray(section.items) ? section.items : []).slice(0, 12).map((item) => ({
                    title: item.title || '',
                    subtitle: item.subtitle || '',
                    date: item.date || '',
                    location: item.location || '',
                    bullets: item.bullets || '',
                })),
            })),
        };

        const prompt = `You are an ATS resume evaluator.
Score this resume from 0 to 100 for ATS readiness and baseline quality.
Also provide one short reason sentence about why the score is what it is.
Return ONLY valid JSON in this exact shape: {"score": number, "reason": string}
- score must be integer 0-100
- reason must be max 180 characters

Resume JSON:
${JSON.stringify(compactCv)}`;

        const generationPromise = flashModel.generateContent(prompt);
        const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 10000);
        });

        const result = await Promise.race([generationPromise, timeoutPromise]);
        if (result === null) {
            return null;
        }

        const rawResponse = result.response.text();
        const cleaned = rawResponse
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleaned) as { score?: unknown; reason?: unknown };

        if (typeof parsed.score !== 'number' || Number.isNaN(parsed.score)) {
            return null;
        }

        const reason = typeof parsed.reason === 'string' ? normalize(parsed.reason) : '';
        if (!reason) {
            return null;
        }

        return {
            score: Math.max(0, Math.min(100, Math.round(parsed.score))),
            reason: reason.length > 180 ? `${reason.slice(0, 177)}...` : reason,
        };
    } catch (error) {
        console.error('Failed to calculate ATS score with AI:', error);
        return null;
    }
}

function calculateHeuristicAts(cvState: SaveCvState): { score: number; reason: string } {
    let score = 35;

    const personalInfo = cvState.personalInfo || {};
    const requiredContactCount = [
        normalize(personalInfo.fullName),
        normalize(personalInfo.email),
        normalize(personalInfo.phone),
        normalize(personalInfo.location),
    ].filter(Boolean).length;

    score += requiredContactCount * 4;

    if (normalize(personalInfo.linkedin)) score += 4;
    if (normalize(personalInfo.portfolio) || normalize(personalInfo.github)) score += 4;

    const summaryWords = countWords(cvState.summary || '');
    if (summaryWords >= 40) score += 10;
    else if (summaryWords >= 20) score += 6;
    else if (summaryWords > 0) score += 3;

    const sections = Array.isArray(cvState.sections) ? cvState.sections : [];
    if (sections.length >= 4) score += 12;
    else if (sections.length >= 2) score += 8;
    else if (sections.length >= 1) score += 4;

    const normalizedTitles = new Set(sections.map((section) => normalize(section.title).toLowerCase()));
    if (hasAny(normalizedTitles, ['experience', 'work experience', 'employment'])) score += 4;
    if (hasAny(normalizedTitles, ['education'])) score += 4;
    if (hasAny(normalizedTitles, ['skills', 'technical skills'])) score += 4;
    if (hasAny(normalizedTitles, ['projects'])) score += 4;

    let bulletLines = 0;
    let quantifiedHits = 0;
    let datedItems = 0;
    let totalItems = 0;

    for (const section of sections) {
        for (const item of section.items || []) {
            totalItems += 1;

            const bullets = normalize(item.bullets)
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);
            bulletLines += bullets.length;

            const itemText = `${normalize(item.title)} ${normalize(item.subtitle)} ${normalize(item.bullets)}`;
            const quantMatches = itemText.match(/(\d+%|\d+\+|\$\d+|\b\d{2,}\b)/g);
            quantifiedHits += quantMatches ? quantMatches.length : 0;

            if (normalize(item.date)) {
                datedItems += 1;
            }
        }
    }

    if (bulletLines >= 20) score += 12;
    else if (bulletLines >= 10) score += 8;
    else if (bulletLines >= 4) score += 4;

    if (quantifiedHits >= 6) score += 10;
    else if (quantifiedHits >= 3) score += 6;
    else if (quantifiedHits >= 1) score += 3;

    if (totalItems > 0) {
        const dateRatio = datedItems / totalItems;
        if (dateRatio >= 0.7) score += 6;
        else if (dateRatio >= 0.4) score += 3;
    }

    const boundedScore = Math.max(20, Math.min(100, Math.round(score)));

    const reasonParts: string[] = [];
    if (sections.length < 2) reasonParts.push('Add more standard sections (Experience, Education, Skills).');
    if (summaryWords < 20) reasonParts.push('Improve your summary with concrete role keywords.');
    if (quantifiedHits < 2) reasonParts.push('Use more measurable results (%, numbers, outcomes).');
    if (reasonParts.length === 0) {
        reasonParts.push('Good ATS structure; improve role-specific keywords and quantified impact to increase score.');
    }

    return {
        score: boundedScore,
        reason: reasonParts.join(' ').slice(0, 180),
    };
}

function normalize(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    return value.replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
    return text
        .trim()
        .split(/\s+/)
        .filter((token) => token.length > 0).length;
}

function hasAny(source: Set<string>, options: string[]): boolean {
    return options.some((option) => source.has(option));
}

